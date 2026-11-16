
import { analisarLexico } from "./lexer.js";
import { analisarSintatico } from "./parser.js";
import { verificar } from "./semantica.js";
import { gerarSVG } from "./gerador.js";
import { desenharSvg, baixarSvg } from "./svg.js";


const ESTILO = {
    erro: "rounded-md border-l-4 border-red-500 bg-red-50 px-3 py-2 text-sm text-red-800",
    aviso: "rounded-md border-l-4 border-amber-500 bg-amber-50 px-3 py-2 text-sm text-amber-800",
    ok: "rounded-md border-l-4 border-emerald-500 bg-emerald-50 px-3 py-2 text-sm text-emerald-800",
};

/**
 * Renderiza uma lista de notificações visuais dentro de um container HTML.
 * @param {HTMLElement} elemento - O container onde as mensagens serão exibidas.
 * @param {Array<{nivel: string, etapa: string, texto: string}>} lista - Lista de alertas.
 */
function mostrar(elemento, lista) {
    // Limpa todas as mensagens exibidas anteriormente
    elemento.innerHTML = "";

    for (const m of lista) {
        const p = document.createElement("p");
        // Aplica a cor correspondente ao nível (erro, aviso ou ok)
        p.className = ESTILO[m.nivel];
        // Monta o texto com o prefixo da etapa, se existir (ex: "Sintático: programa válido.")
        // Usa textContent por segurança para evitar injeção de HTML/XSS
        p.textContent = m.etapa ? m.etapa + ": " + m.texto : m.texto;
        elemento.appendChild(p);
    }
}


/**
 * Lê o código XML/SVG da caixa de saída e o desenha na área visual da página.
 */
function desenhar() {
    const texto = document.getElementById("saida").value;
    const resultado = desenharSvg(texto, document.getElementById("figura"));

    // Define a cor do alerta com base no status retornado pelo renderizador
    let nivel = "ok";
    if (!resultado.ok) {
        nivel = "erro";
    } else if (resultado.aviso) {
        nivel = "aviso";
    }

    // Exibe o feedback visual logo abaixo da figura
    mostrar(document.getElementById("msg-svg"), [{ nivel: nivel, etapa: "", texto: resultado.mensagem }]);
}


/**
 * Executa sequencialmente as 4 etapas da compilação:
 * 1. Análise Léxica -> 2. Análise Sintática -> 3. Análise Semântica -> 4. Geração de Código
 */
function analisar() {
    // Captura o código-fonte digitado pelo usuário e prepara as áreas da tela
    const texto = document.getElementById("entrada").value;
    const area = document.getElementById("mensagens");
    const mensagens = [];

    // Limpa os painéis de debug (Tokens e AST) antes de iniciar uma nova análise
    document.getElementById("tokens").textContent = "";
    document.getElementById("ast").textContent = "";

    // ------------------------------------------------------------------------
    // ETAPA 1: ANÁLISE LÉXICA (Texto -> Lista de Tokens)
    // ------------------------------------------------------------------------
    let resultado;
    try {
        resultado = analisarLexico(texto);
    } catch (falha) {
        // Captura erros inesperados na execução do lexer
        mensagens.push({ nivel: "aviso", etapa: "Léxico", texto: falha.message });
        mostrar(area, mensagens);
        return;
    }

    // Formata e exibe os tokens reconhecidos no painel correspondente
    const linhasTokens = [];
    for (const token of resultado.tokens) {
        linhasTokens.push("linha " + token.linha + "  " + token.tipo.padEnd(14) + '"' + token.lexema + '"');
    }
    document.getElementById("tokens").textContent = linhasTokens.join("\n");

    // Se houver caracteres ou palavras inválidas, exibe os erros e interrompe o fluxo
    if (resultado.erros.length > 0) {
        for (const erro of resultado.erros) {
            mensagens.push({
                nivel: "erro",
                etapa: "Erro léxico",
                texto: 'linha ' + erro.linha + ': "' + erro.lexema + '" não forma nenhum token'
            });
        }
        mostrar(area, mensagens);
        return; // Aborta as próximas fases
    }

    // ------------------------------------------------------------------------
    // ETAPA 2: ANÁLISE SINTÁTICA (Tokens -> Árvore de Sintaxe Abstrata / AST)
    // ------------------------------------------------------------------------
    let ast;
    try {
        ast = analisarSintatico(resultado.tokens);
    } catch (falha) {
        // O parser lança exceção quando a gramática não é respeitada
        mensagens.push({ nivel: "erro", etapa: "", texto: falha.message });
        mostrar(area, mensagens);
        return; // Aborta as próximas fases
    }

    // Verifica se a função do parser já foi implementada
    if (ast === undefined) {
        mensagens.push({
            nivel: "aviso",
            etapa: "Sintático",
            texto: "parser.js ainda não devolve a AST: complete analisarSintatico()."
        });
        mostrar(area, mensagens);
        return;
    }

    // Exibe a árvore gerada formatada em JSON e registra o sucesso
    document.getElementById("ast").textContent = JSON.stringify(ast, null, 2);
    mensagens.push({ nivel: "ok", etapa: "Sintático", texto: "programa válido." });

    // ------------------------------------------------------------------------
    // ETAPA 3: ANÁLISE SEMÂNTICA (Validação de regras e tipos na AST)
    // ------------------------------------------------------------------------
    let errosSemanticos;
    try {
        errosSemanticos = verificar(ast);
    } catch (falha) {
        mensagens.push({ nivel: "erro", etapa: "Semântico", texto: falha.message });
        mostrar(area, mensagens);
        return;
    }

    if (errosSemanticos === undefined) {
        // Avisa caso o arquivo semantica.js ainda esteja vazio, mas permite continuar
        mensagens.push({
            nivel: "aviso",
            etapa: "Semântico",
            texto: "verificar() ainda não foi implementada (Fase 2)."
        });
    } else if (errosSemanticos.length > 0) {
        // Se houver violações semânticas (ex: raio negativo, cor inválida), exibe e para
        for (const erro of errosSemanticos) {
            mensagens.push({
                nivel: "erro",
                etapa: "Erro semântico",
                texto: "linha " + erro.linha + ": " + erro.mensagem
            });
        }
        mostrar(area, mensagens);
        return; // Não gera SVG se o programa tiver erro semântico
    }

    // ------------------------------------------------------------------------
    // ETAPA 4: GERAÇÃO DE CÓDIGO (AST -> Código SVG)
    // ------------------------------------------------------------------------
    let svg;
    try {
        svg = gerarSVG(ast);
    } catch (falha) {
        mensagens.push({ nivel: "erro", etapa: "Gerador", texto: falha.message });
        mostrar(area, mensagens);
        return;
    }

    // Verifica se a função do gerador já foi implementada
    if (svg === undefined) {
        mensagens.push({
            nivel: "aviso",
            etapa: "Gerador",
            texto: "gerarSVG() ainda não foi implementada (Fase 2)."
        });
        mostrar(area, mensagens);
        return;
    }

    // Preenche a caixa de texto da direita com o SVG gerado, mostra feedback e desenha na tela
    document.getElementById("saida").value = svg;
    mensagens.push({ nivel: "ok", etapa: "Gerador", texto: "SVG gerado." });
    mostrar(area, mensagens);
    desenhar();
}



// Conecta os botões da página às suas respectivas funções
document.getElementById("btn-analisar").addEventListener("click", analisar);
document.getElementById("btn-desenhar").addEventListener("click", desenhar);
document.getElementById("btn-baixar").addEventListener("click", function () {
    baixarSvg(document.getElementById("saida").value);
});

// Renderiza imediatamente qualquer código SVG que já venha preenchido no HTML ao abrir a página
desenhar();
