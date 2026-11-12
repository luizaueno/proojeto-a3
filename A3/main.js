
import { analisarLexico } from "./lexer.js";
import { analisarSintatico } from "./parser.js";

const entrada = document.getElementById("entrada")
const saida = document.getElementById("saida")

entrada.value = `area_desenho 400 225
// Exemplo com grupo aninhado
ret 50 100 150 60 preenchimento azul contorno preto espessura 3
conjunto deslocamento 70 120 giro 45 [
  circ 0 0 25 preenchimento #FF0000
  conjunto giro 30 [
    linha 0 0 20 0 contorno verde
  ]
]`

/**
 * Controla o fluxo principal de análise (Léxica e Sintática) e atualiza a interface.
 */
function analisar() {
  // Executa a análise léxica a partir do texto do campo de entrada
  
  // Desestrutura o resultado para obter a lista de tokens e os erros encontrados
  const { tokens, erros } = analisarLexico(entrada.value);
  
  // Array que acumulará todas as strings que serão exibidas na tela de saída
  const linhas = ["TOKENS:"];

  // Formata e adiciona cada token gerado na lista de exibição
  for (const token of tokens) {
    linhas.push(
      // Alinha visualmente o tipo do token deixando um espaço fixo de 15 caracteres
      `linha ${token.linha} ${token.tipo.padEnd(15)} "${token.lexema}"`
    );
  }

  // Adiciona uma linha em branco para separar visualmente os blocos na saída
  linhas.push("");

  // Se houver algum erro léxico, interrompe a análise e lista os erros
  if (erros.length) {
    for (const erro of erros) {
      linhas.push(
        `Erro léxico na linha ${erro.linha}: "${erro.trecho}" não forma nenhum token`
      );
    }
  } else {
    // Caso não haja erros léxicos, prossegue para a análise sintática
    try {
      // Tenta gerar a Árvore de Sintaxe Abstrata (AST) a partir dos tokens
      const ast = analisarSintatico(tokens);
      
      // Se a análise for bem-sucedida, informa o usuário e exibe a AST formatada
      linhas.push("Análise sintática: programa válido");
      linhas.push("AST:");
      linhas.push(JSON.stringify(ast, null, 2)); // Formata o JSON com recuo de 2 espaços
    } catch (erro) {
      // Captura eventuais erros sintáticos disparados pela função analisarSintatico
      linhas.push(erro.message);
    }
  }
  // Une todas as strings do array separadas por quebras de linha e renderiza na tela
  saida.textContent = linhas.join("\n");
}

// Vincula a execução da função ao clique do botão da interface
document.getElementById("botao").addEventListener("click", analisar);

// Executa a função imediatamente ao carregar a página para analisar o estado inicial
analisar();