/**
 * Realiza a análise sintática (Parser) a partir de uma lista de tokens.
 * Constrói e retorna uma Árvore de Sintaxe Abstrata (AST) caso a gramática seja válida.
 * 
 * @param {Array} tokens - Lista de tokens gerada pelo analisador léxico.
 * @returns {Object} O objeto que representa a raiz da AST ("programa").
 * @throws {Error} Dispara um erro detalhado contendo a linha e o motivo da falha.
 */
export function analisarSintatico(tokens) {
  let i = 0; // Índice (ponteiro) que rastreia o token atual

  // Define a última linha conhecida do programa para dar contexto caso ocorra erro no final do arquivo
  const linhaFinal = tokens.length
    ? tokens[tokens.length - 1].linha
    : 1;

  // Retorna o token atual apontado pelo ponteiro
  function atual() {
    return tokens[i];
  }

  // Interrompe o processo lançando uma exceção de erro sintático formatada
  function falhar(esperado) {
    const token = atual();
    const linha = token ? token.linha : linhaFinal;
    const encontrado = token
      ? `${token.tipo} (${token.lexema})`
      : "fim do programa";

    throw new Error(
      `Erro sintático na linha ${linha}: esperado ${esperado}, encontrado ${encontrado}`
    );
  }

  // Verifica se o token atual é do tipo esperado. Se for, avança o ponteiro. Se não, falha.
  function esperar(tipo) {
    const token = atual();

    if (!token || token.tipo !== tipo) {
      falhar(tipo);
    }

    i++; // Avança para o próximo token
    return token;
  }

  // Consome um token do tipo "NUM" e o converte para um tipo Number nativo do JS
  function numero() {
    return Number(esperar("NUM").lexema);
  }

  // Consome um token de cor (seja nome de cor literal ou formato hexadecimal)
  function cor() {
    const token = atual();

    if (!token || !["COR", "COR_HEX"].includes(token.tipo)) {
      falhar("COR ou COR_HEX");
    }

    i++;
    return token.lexema;
  }

  // Analisa uma sequência de atributos opcionais e desordenados (contorno, preenchimento, espessura)
  function atributos() {
    const resultado = {};

    // Mapeamento dos tokens da gramática para as chaves da AST final
    const nomes = {
      CONTORNO: "contorno",
      PREENCHIMENTO: "preenchimento",
      ESPESSURA: "espessura"
    };

    // Continua lendo enquanto o token atual for um dos tokens de atributo válidos
    while (atual() && Object.hasOwn(nomes, atual().tipo)) {
      const tipo = atual().tipo;
      const nome = nomes[tipo];

      // Se o atributo já foi processado nesta sequência, barra a duplicação na gramática
      if (Object.hasOwn(resultado, nome)) {
        falhar(`atributo diferente de ${tipo}`);
      }

      esperar(tipo); // Consome o identificador do atributo

      // Define o valor do atributo na AST, convertendo para número se for espessura
      resultado[nome] = tipo === "ESPESSURA"
        ? numero()
        : cor();
    }

    return resultado;
  }

  // Analisa as formas geométricas primitivas (LINHA, CIRC, RET)
  function forma() {
    const tipo = atual()?.tipo;

    // Regra da Linha: LINHA x1 y1 x2 y2 [atributos]
    if (tipo === "LINHA") {
      esperar("LINHA");

      const x1 = numero();
      const y1 = numero();
      const x2 = numero();
      const y2 = numero();

      return {
        tipo: "linha",
        x1,
        y1,
        x2,
        y2,
        atributos: atributos() // Tenta consumir os atributos da linha
      };
    }

    // Regra do Círculo: CIRC x y raio [atributos]
    if (tipo === "CIRC") {
      esperar("CIRC");

      const x = numero();
      const y = numero();
      const raio = numero();

      return {
        tipo: "circulo",
        x,
        y,
        raio,
        atributos: atributos()
      };
    }

    // Regra do Retângulo: RET x y largura altura [atributos]
    if (tipo === "RET") {
      esperar("RET");

      const x = numero();
      const y = numero();
      const largura = numero();
      const altura = numero();

      return {
        tipo: "retangulo",
        x,
        y,
        largura,
        altura,
        atributos: atributos()
      };
    }

    falhar("LINHA, CIRC ou RET");
  }

  // Analisa uma estrutura de agrupamento "CONJUNTO" contendo modificadores e elementos internos
  function conjunto() {
    esperar("CONJUNTO");

    const modificadores = [];
    const usados = new Set(); // Rastreia modificadores duplicados para barrá-los

    // Lê os modificadores opcionais (GIRO, DESLOCAMENTO) do conjunto
    while (
      atual() &&
      ["GIRO", "DESLOCAMENTO"].includes(atual().tipo)
    ) {
      const tipo = atual().tipo;

      // Impede que um mesmo modificador se repita no mesmo bloco de conjunto
      if (usados.has(tipo)) {
        falhar(`modificador diferente de ${tipo}`);
      }

      usados.add(tipo);
      esperar(tipo);

      // Adiciona o modificador estruturado à lista de modificadores do conjunto
      if (tipo === "GIRO") {
        modificadores.push({
          tipo: "giro",
          angulo: numero()
        });
      } else {
        modificadores.push({
          tipo: "deslocamento",
          dx: numero(),
          dy: numero()
        });
      }
    }

    // Delimitador de início do bloco de elementos do conjunto
    esperar("ABRE");

    const elementos = [];

    // Erro semântico/sintático estrutural: proíbe a declaração de conjuntos vazios "{ }"
    if (atual()?.tipo === "FECHA") {
      falhar(
        "LINHA, CIRC, RET ou CONJUNTO (grupo não vazio)"
      );
    }

    // Continua processando subelementos recursivamente até encontrar o delimitador de fechamento
    while (atual() && atual().tipo !== "FECHA") {
      elementos.push(elemento());
    }

    // Delimitador de fim do bloco de elementos do conjunto
    esperar("FECHA");

    return {
      tipo: "conjunto",
      modificadores,
      elementos
    };
  }

  // Determina e direciona qual é o tipo de elemento a ser lido (formas básicas ou um novo subconjunto)
  function elemento() {
    const tipo = atual()?.tipo;

    if (tipo === "CONJUNTO") {
      return conjunto();
    }

    if (["LINHA", "CIRC", "RET"].includes(tipo)) {
      return forma();
    }

    falhar("LINHA, CIRC, RET ou CONJUNTO");
  }

  /* --- PONTO DE ENTRADA DO COMPILADOR --- */

  // Todo programa gráfico válido precisa inicializar declarando a área de desenho
  esperar("AREA_DESENHO");

  const largura = numero();
  const altura = numero();
  const elementos = [];

  // Consome todos os elementos que existem no código sequencialmente até o fim do arquivo
  while (atual()) {
    elementos.push(elemento());
  }

  // Retorna a raiz da Árvore de Sintaxe Abstrata (AST) completamente montada
  return {
    tipo: "programa",
    tela: { largura, altura },
    elementos
  };
}
