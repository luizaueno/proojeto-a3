import { regras } from "./tokens.js";

/**
 * Realiza a análise léxica de um texto de entrada com base em regras de expressões regulares.
 * @param {string} texto - O código-fonte a ser analisado.
 * @returns {Object} Um objeto contendo a lista de tokens válidos e a lista de erros encontrados.
 */
export function analisarLexico(texto) {
  const tokens = [];
  const erros = [];
  let pos = 0;      // Ponteiro que indica a posição atual do caractere no texto
  let linha = 1;    // Contador para rastrear o número da linha atual

  // Percorre todo o texto de entrada até o final
  while (pos < texto.length) {
    let reconheceu = false;

    // Tenta encontrar uma correspondência testando cada regra léxica definida
    for (const regra of regras) {
      // Ajusta o índice inicial da busca do Regex para a posição atual do ponteiro
      regra.padrao.lastIndex = pos;
      const correspondencia = regra.padrao.exec(texto);

      // Se o padrão não casar imediatamente na posição atual, pula para a próxima regra
      if (!correspondencia) continue;

      // Obtém o texto exato que casou com a expressão regular
      const lexema = correspondencia[0];

      // Se a regra não for configurada para ser ignorada (ex: espaços ou comentários)
      if (!regra.ignorar) {
        tokens.push({
          tipo: regra.tipo,
          lexema,
          linha
        });
      }

      // Conta quantas quebras de linha (\n) existem no lexema atual e atualiza o contador
      linha += (lexema.match(/\n/g) || []).length;
      
      // Avança o ponteiro principal para o fim do trecho que acabou de ser casado pelo Regex
      pos = regra.padrao.lastIndex;
      reconheceu = true;
      break; // Interrompe o laço de regras para passar para o próximo caractere do texto
    }

    // Se nenhuma regra Regex casou na posição atual, trata como um caractere inválido (erro)
    if (!reconheceu) {
      const inicio = pos;
      const linhaErro = linha;

      // Avança o ponteiro até encontrar um espaço em branco ou o fim do texto,
      // agrupando todo o trecho inválido em um único erro de palavra (token inválido)
      while (pos < texto.length && !/\s/.test(texto[pos])) {
        pos++;
      }

      // Recorta o trecho que gerou o erro léxico e o adiciona na lista de erros
      const lexema = texto.slice(inicio, pos);
      erros.push({ linha: linhaErro, lexema });
    }
  }

  // Retorna as duas listas consolidadas para uso no analisador sintático/interface
  return { tokens, erros };
}
