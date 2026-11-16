
//
//   Recebe:  a AST do programa
//   Devolve: um vetor de erros: [ { linha, mensagem }, ... ]
//            (vetor vazio = nenhum erro encontrado)

export function verificar(ast) {
    const erros = [];

    function registrarErro(linha, mensagem) {
        erros.push({
            linha: linha ?? 1,
            mensagem
        });
    }

    // 1) Verificação obrigatória: Tela com largura ou altura <= 0
    if (ast.tela.largura <= 0 || ast.tela.altura <= 0) {
        registrarErro(
            ast.tela.linha,
            "a tela precisa ter largura e altura maiores que zero"
        );
    }

    // Percorre recursivamente todos os elementos (incluindo grupos aninhados)
    function verificarElemento(no) {
        if (no.tipo === "circulo") {
            // 2) Verificação obrigatória: Círculo com raio <= 0
            if (no.raio <= 0) {
                registrarErro(
                    no.linha,
                    "o círculo precisa ter raio maior que zero"
                );
            }
        } else if (no.tipo === "retangulo") {
            // 3) Verificação obrigatória: Retângulo com largura ou altura <= 0
            if (no.largura <= 0 || no.altura <= 0) {
                registrarErro(
                    no.linha,
                    "o retângulo precisa ter largura e altura maiores que zero"
                );
            }
        } else if (no.tipo === "conjunto") {
            // Desce recursivamente nos filhos do grupo
            for (const filho of no.elementos) {
                verificarElemento(filho);
            }
        }
    }

    for (const el of ast.elementos) {
        verificarElemento(el);
    }

    return erros;
}
