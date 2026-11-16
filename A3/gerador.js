// gerador.js · gerador de código SVG (Fase 2)
//
//   Recebe:  a AST validada do programa
//   Devolve: string contendo o código XML/SVG completo

// Tabela de mapeamento das 6 cores literais definidas no tokens.js para nomes do SVG
const TABELA_CORES = {
    preto: "black",
    vermelho: "red",
    azul: "blue",
    amarelo: "yellow",
    roxo: "purple",
    verde: "green"
};

/**
 * Converte uma cor da AST para um valor válido no SVG.
 * Se começar com '#', passa direto; caso contrário, traduz pela tabela.
 */
function resolverCor(valor) {
    if (!valor) return null;
    if (valor.startsWith("#")) return valor;
    return TABELA_CORES[valor.toLowerCase()] || valor;
}

/**
 * Monta os atributos de estilo padrão do SVG para qualquer forma geométrica.
 * Padrões exigidos pelo enunciado: stroke="black", fill="none", stroke-width="1"
 */
function gerarEstilo(atributos = {}) {
    const stroke = atributos.contorno ? resolverCor(atributos.contorno) : "black";
    const fill = atributos.preenchimento ? resolverCor(atributos.preenchimento) : "none";
    const strokeWidth = atributos.espessura !== undefined ? atributos.espessura : 1;

    return `fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"`;
}

/**
 * Percorre a AST recursivamente e gera o código XML/SVG indentado.
 */
export function gerarSVG(ast) {
    // Função recursiva que visita cada nó e desce nos filhos de conjuntos
    function gerarElemento(no, nivel) {
        const espaco = "  ".repeat(nivel);

        if (no.tipo === "linha") {
            const estilo = gerarEstilo(no.atributos);
            return `${espaco}<line x1="${no.x1}" y1="${no.y1}" x2="${no.x2}" y2="${no.y2}" ${estilo}/>`;
        }

        if (no.tipo === "circulo") {
            const estilo = gerarEstilo(no.atributos);
            return `${espaco}<circle cx="${no.x}" cy="${no.y}" r="${no.raio}" ${estilo}/>`;
        }

        if (no.tipo === "retangulo") {
            const estilo = gerarEstilo(no.atributos);
            return `${espaco}<rect x="${no.x}" y="${no.y}" width="${no.largura}" height="${no.altura}" ${estilo}/>`;
        }

        if (no.tipo === "conjunto") {
            // Monta o atributo transform preservando a ordem exata em que foram escritos
            const transformacoes = [];
            for (const mod of no.modificadores) {
                if (mod.tipo === "giro") {
                    transformacoes.push(`rotate(${mod.angulo})`);
                } else if (mod.tipo === "deslocamento") {
                    transformacoes.push(`translate(${mod.dx} ${mod.dy})`);
                }
            }

            // Se houver modificadores, inclui transform="..."; se não houver, abre <g> simples
            const abertura = transformacoes.length > 0
                ? `${espaco}<g transform="${transformacoes.join(" ")}">`
                : `${espaco}<g>`;

            // Gera recursivamente todos os elementos internos com um nível a mais de indentação
            const filhos = no.elementos.map(filho => gerarElemento(filho, nivel + 1));

            return [abertura, ...filhos, `${espaco}</g>`].join("\n");
        }

        return "";
    }

    const { largura, altura } = ast.tela;
    const aberturaSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${largura}" height="${altura}" viewBox="0 0 ${largura} ${altura}">`;
    const corpo = ast.elementos.map(el => gerarElemento(el, 1));
    const fechamentoSvg = `</svg>`;

    return [aberturaSvg, ...corpo, fechamentoSvg].join("\n");
}
