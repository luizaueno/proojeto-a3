# Casos de Teste — Linguagem de Desenho

**Atividade:** Fase 1 — Uma Linguagem para Desenhar

## 1. Objetivo

Este documento apresenta os casos de teste utilizados para verificar o funcionamento dos analisadores léxico e sintático da Linguagem de Desenho.

Foram definidos **8 casos de teste**, sendo:

- 5 programas válidos, que exercitam as funcionalidades da linguagem.
- 1 programa inválido com erro léxico.
- 2 programas inválidos com erros sintáticos diferentes.

Os testes verificam o reconhecimento dos tokens, a validação das instruções, a construção da Árvore Sintática Abstrata (AST) e o tratamento de erros.

## 2. Testes válidos

### Teste 1 — Figuras geométricas básicas

**Objetivo:** verificar o reconhecimento da declaração da área de desenho e das três figuras geométricas sem atributos opcionais.

**Programa de entrada:**

```text
area_desenho 400 225
linha 0 0 100 100
circ 100 100 25
ret 20 30 100 50
```

**Resultado esperado:**

- Nenhum erro léxico.
- Análise sintática válida.
- AST contendo três elementos: linha, círculo e retângulo.
- Parâmetros numéricos armazenados como números.
- Objetos de atributos vazios nas três figuras.

**AST esperada:**

```json
{
  "tipo": "programa",
  "tela": {
    "largura": 400,
    "altura": 225
  },
  "elementos": [
    {
      "tipo": "linha",
      "x1": 0,
      "y1": 0,
      "x2": 100,
      "y2": 100,
      "atributos": {}
    },
    {
      "tipo": "circulo",
      "x": 100,
      "y": 100,
      "raio": 25,
      "atributos": {}
    },
    {
      "tipo": "retangulo",
      "x": 20,
      "y": 30,
      "largura": 100,
      "altura": 50,
      "atributos": {}
    }
  ]
}
```

---

### Teste 2 — Atributos e cores

**Objetivo:** verificar o reconhecimento de atributos opcionais em diferentes ordens, cores nomeadas e cores hexadecimais.

**Programa de entrada:**

```text
area_desenho 500 300
linha 0 0 200 100 espessura 4 contorno vermelho
circ 150 150 40 preenchimento #AABBCC contorno preto
ret 30 40 120 80 contorno verde espessura 2 preenchimento amarelo
```

**Resultado esperado:**

- Nenhum erro léxico.
- Análise sintática válida.
- AST contendo uma linha, um círculo e um retângulo.
- Reconhecimento dos atributos `contorno`, `preenchimento` e `espessura`.
- Reconhecimento da cor hexadecimal `#AABBCC`.
- Preservação dos valores de cada atributo.

**AST esperada:**

```json
{
  "tipo": "programa",
  "tela": {
    "largura": 500,
    "altura": 300
  },
  "elementos": [
    {
      "tipo": "linha",
      "x1": 0,
      "y1": 0,
      "x2": 200,
      "y2": 100,
      "atributos": {
        "espessura": 4,
        "contorno": "vermelho"
      }
    },
    {
      "tipo": "circulo",
      "x": 150,
      "y": 150,
      "raio": 40,
      "atributos": {
        "preenchimento": "#AABBCC",
        "contorno": "preto"
      }
    },
    {
      "tipo": "retangulo",
      "x": 30,
      "y": 40,
      "largura": 120,
      "altura": 80,
      "atributos": {
        "contorno": "verde",
        "espessura": 2,
        "preenchimento": "amarelo"
      }
    }
  ]
}
```

---

### Teste 3 — Conjunto com modificadores

**Objetivo:** verificar o reconhecimento de conjuntos com giro e deslocamento, preservando a ordem dos modificadores.

**Programa de entrada:**

```text
area_desenho 600 400
conjunto giro 90 deslocamento 50 30 [
  circ 100 100 20 preenchimento roxo
  linha 0 0 100 0 contorno azul
]
```

**Resultado esperado:**

- Nenhum erro léxico.
- Análise sintática válida.
- AST contendo um conjunto.
- Reconhecimento de dois modificadores.
- Preservação da ordem: primeiro `giro`, depois `deslocamento`.
- Conjunto contendo um círculo e uma linha.

**AST esperada:**

```json
{
  "tipo": "programa",
  "tela": {
    "largura": 600,
    "altura": 400
  },
  "elementos": [
    {
      "tipo": "conjunto",
      "modificadores": [
        {
          "tipo": "giro",
          "angulo": 90
        },
        {
          "tipo": "deslocamento",
          "dx": 50,
          "dy": 30
        }
      ],
      "elementos": [
        {
          "tipo": "circulo",
          "x": 100,
          "y": 100,
          "raio": 20,
          "atributos": {
            "preenchimento": "roxo"
          }
        },
        {
          "tipo": "linha",
          "x1": 0,
          "y1": 0,
          "x2": 100,
          "y2": 0,
          "atributos": {
            "contorno": "azul"
          }
        }
      ]
    }
  ]
}
```

---

### Teste 4 — Conjuntos aninhados

**Objetivo:** verificar a análise recursiva de conjuntos, incluindo três níveis de aninhamento.

**Programa de entrada:**

```text
area_desenho 800 600
conjunto deslocamento 20 40 giro 45 [
  ret 10 10 80 50 preenchimento verde
  conjunto giro 30 [
    circ 0 0 15 contorno #FF00AA
    conjunto deslocamento 5 10 [
      linha 0 0 30 30
    ]
  ]
]
```

**Resultado esperado:**

- Nenhum erro léxico.
- Análise sintática válida.
- AST contendo um conjunto externo.
- Conjunto externo contendo um retângulo e outro conjunto.
- Conjunto intermediário contendo um círculo e um terceiro conjunto.
- Conjunto interno contendo uma linha.
- Preservação dos três níveis de aninhamento.
- Preservação da ordem dos modificadores.

**AST esperada:**

```json
{
  "tipo": "programa",
  "tela": {
    "largura": 800,
    "altura": 600
  },
  "elementos": [
    {
      "tipo": "conjunto",
      "modificadores": [
        {
          "tipo": "deslocamento",
          "dx": 20,
          "dy": 40
        },
        {
          "tipo": "giro",
          "angulo": 45
        }
      ],
      "elementos": [
        {
          "tipo": "retangulo",
          "x": 10,
          "y": 10,
          "largura": 80,
          "altura": 50,
          "atributos": {
            "preenchimento": "verde"
          }
        },
        {
          "tipo": "conjunto",
          "modificadores": [
            {
              "tipo": "giro",
              "angulo": 30
            }
          ],
          "elementos": [
            {
              "tipo": "circulo",
              "x": 0,
              "y": 0,
              "raio": 15,
              "atributos": {
                "contorno": "#FF00AA"
              }
            },
            {
              "tipo": "conjunto",
              "modificadores": [
                {
                  "tipo": "deslocamento",
                  "dx": 5,
                  "dy": 10
                }
              ],
              "elementos": [
                {
                  "tipo": "linha",
                  "x1": 0,
                  "y1": 0,
                  "x2": 30,
                  "y2": 30,
                  "atributos": {}
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

---

### Teste 5 — Comentários, zero e atributos opcionais

**Objetivo:** verificar o tratamento de comentários, aceitação do número zero e reconhecimento de conjuntos sem modificadores.

**Programa de entrada:**

```text
area_desenho 300 200
// Teste de comentarios
circ 0 0 0
conjunto [
  // Figura sem atributos
  ret 0 0 50 50
  linha 0 0 0 100 contorno preto
]
// Fim do programa
```

**Resultado esperado:**

- Nenhum erro léxico.
- Análise sintática válida.
- Comentários ignorados pelo lexer.
- Aceitação do valor zero.
- AST contendo um círculo e um conjunto.
- Conjunto com array de modificadores vazio.
- Retângulo sem atributos opcionais.
- Linha com atributo de contorno.

**AST esperada:**

```json
{
  "tipo": "programa",
  "tela": {
    "largura": 300,
    "altura": 200
  },
  "elementos": [
    {
      "tipo": "circulo",
      "x": 0,
      "y": 0,
      "raio": 0,
      "atributos": {}
    },
    {
      "tipo": "conjunto",
      "modificadores": [],
      "elementos": [
        {
          "tipo": "retangulo",
          "x": 0,
          "y": 0,
          "largura": 50,
          "altura": 50,
          "atributos": {}
        },
        {
          "tipo": "linha",
          "x1": 0,
          "y1": 0,
          "x2": 0,
          "y2": 100,
          "atributos": {
            "contorno": "preto"
          }
        }
      ]
    }
  ]
}
```

---

## 3. Testes inválidos

### Teste 6 — Erro léxico: número com zero à esquerda

**Objetivo:** verificar a rejeição de números com zeros à esquerda.

**Programa de entrada:**

```text
area_desenho 400 225
circ 05 100 25
```

**Resultado esperado:**

```text
Erro léxico na linha 2: "05" não forma nenhum token
```

**Comportamento esperado:**

- O lexer identifica `05` como trecho inválido.
- O erro é associado à linha 2.
- O parser não é executado.
- Nenhuma AST é gerada.

**Justificativa:** a linguagem aceita o número zero, mas não permite números com zeros à esquerda.

---

### Teste 7 — Erro sintático: parâmetro incorreto

**Objetivo:** verificar o tratamento de um token inesperado nos parâmetros de uma figura.

**Programa de entrada:**

```text
area_desenho 400 225
circ 100 azul 25
```

**Resultado esperado:**

```text
Erro sintático na linha 2: esperado NUM, encontrado COR (azul)
```

**Comportamento esperado:**

- O lexer reconhece todos os tokens.
- O parser identifica um token `COR` onde deveria existir um `NUM`.
- A análise sintática é interrompida no primeiro erro.
- Nenhuma AST válida é gerada.

**Justificativa:** a instrução `circ` exige três parâmetros numéricos: posição horizontal, posição vertical e raio.

---

### Teste 8 — Erro sintático: conjunto vazio

**Objetivo:** verificar a regra que proíbe conjuntos sem elementos.

**Programa de entrada:**

```text
area_desenho 400 225
conjunto [
]
```

**Resultado esperado:**

```text
Erro sintático na linha 3: esperado LINHA, CIRC, RET ou CONJUNTO (grupo não vazio), encontrado FECHA (])
```

**Comportamento esperado:**

- O lexer reconhece todos os tokens.
- O parser identifica o fechamento do conjunto sem nenhum elemento interno.
- A análise sintática é interrompida.
- Nenhuma AST válida é gerada.

**Justificativa:** a linguagem exige que cada conjunto contenha pelo menos uma figura ou outro conjunto.

---

## 4. Resumo dos casos de teste

| Teste | Categoria | Resultado esperado |
|---|---|---|
| 1 — Figuras básicas | Válido | AST com linha, círculo e retângulo |
| 2 — Atributos e cores | Válido | AST com atributos e cores |
| 3 — Modificadores | Válido | AST com giro e deslocamento |
| 4 — Conjuntos aninhados | Válido | AST com três níveis de conjuntos |
| 5 — Comentários e zero | Válido | Comentários ignorados e AST válida |
| 6 — Zero à esquerda | Inválido léxico | Erro na linha 2 |
| 7 — Parâmetro incorreto | Inválido sintático | Esperado NUM, encontrado COR |
| 8 — Conjunto vazio | Inválido sintático | Erro ao encontrar FECHA |

## 5. Cobertura dos requisitos

Os testes válidos, em conjunto, verificam:

- Declaração obrigatória da área de desenho.
- Reconhecimento das três figuras geométricas.
- Parâmetros numéricos.
- Atributos de contorno, preenchimento e espessura.
- Cores nomeadas e hexadecimais.
- Diferentes ordens de atributos.
- Giro e deslocamento.
- Diferentes ordens de modificadores.
- Conjuntos sem modificadores.
- Conjuntos aninhados.
- Comentários ignorados.
- Aceitação do número zero.
- Construção da AST.

Os testes inválidos verificam:

- Reconhecimento de erro léxico.
- Interrupção da análise antes do parser quando há erro léxico.
- Identificação de parâmetro sintaticamente incorreto.
- Rejeição de conjuntos vazios.
- Mensagens contendo linha, elemento esperado e elemento encontrado.

## 6. Conclusão

Os oito casos de teste foram definidos para verificar o comportamento dos analisadores léxico e sintático da Linguagem de Desenho.

Os cinco programas válidos exercitam os principais elementos da linguagem e verificam a construção da AST.

Os três programas inválidos verificam o reconhecimento de erros léxicos e sintáticos, incluindo a interrupção da análise quando uma instrução não respeita as regras estabelecidas.

Os resultados apresentados neste documento são os **resultados esperados** para cada programa e devem ser comparados com a saída produzida pela implementação.