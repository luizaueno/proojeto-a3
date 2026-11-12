
export const regras = [
  // Espaços e comentários
  { tipo: "ESPACO", padrao: /\s+/y, ignorar: true },
  { tipo: "COMENTARIO", padrao: /\/\/[^\r\n]*/y, ignorar: true },

  // Declaração da tela
  { tipo: "AREA_DESENHO", padrao: /area_desenho\b/y },

  // Formas geométricas
  { tipo: "LINHA", padrao: /linha\b/y },
  { tipo: "CIRC", padrao: /circ\b/y },
  { tipo: "RET", padrao: /ret\b/y },

  // Grupos e modificadores
  { tipo: "CONJUNTO", padrao: /conjunto\b/y },
  { tipo: "GIRO", padrao: /giro\b/y },
  { tipo: "DESLOCAMENTO", padrao: /deslocamento\b/y },

  // Atributos de estilo
  { tipo: "CONTORNO", padrao: /contorno\b/y },
  { tipo: "PREENCHIMENTO", padrao: /preenchimento\b/y },
  { tipo: "ESPESSURA", padrao: /espessura\b/y },

  // Cores
  { tipo: "COR_HEX", padrao: /#[0-9A-Fa-f]{6}(?![A-Za-z0-9_])/y },
  { tipo: "COR", padrao: /(?:preto|vermelho|azul|amarelo|roxo|verde)\b/y },

  // Números inteiros  sem zeros à esquerda
  { tipo: "NUM", padrao: /(?:0|[1-9][0-9]*)(?![0-9])/y },

  // Delimitadores dos grupos
  { tipo: "ABRE", padrao: /\[/y },
  { tipo: "FECHA", padrao: /\]/y },
];
