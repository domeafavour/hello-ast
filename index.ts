// tokenizer(input: string): Token[]
// parser(tokens: Token[]): AST
// transformer(ast: AST): newAST

const NUM_RE = /[0-9]/;
const WHITESPACE = /\s/;

const LEFT_PAREN = '(';
const RIGHT_PAREN = ')';
const ADD = 'add';
const SUBTRACT = 'subtract';

type NumberToken = {
  type: 'number';
  value: string;
};

type NameValue = typeof ADD | typeof SUBTRACT;

type NameToken = {
  type: 'name';
  value: NameValue;
};

type ParenToken = {
  type: 'paren';
  value: typeof LEFT_PAREN | typeof RIGHT_PAREN;
};

type Token = NumberToken | NameToken | ParenToken;

// { type: 'number', value: '1' },
// { type: 'name', value: 'add' },
// { type: 'paren', value: '(' },
// { type: 'number', value: '2' },
// { type: 'name', value: 'add' },
// { type: 'number', value: '31' },
// { type: 'name', value: 'subtract' },
// { type: 'paren', value: ')' }
// { type: 'name', value: 'add' },
// { type: 'number', value: '5' },

function tokenizer(input: string) {
  let current = 0;
  const tokens: Token[] = [];
  while (current < input.length) {
    let char = input[current];
    if (char === LEFT_PAREN) {
      tokens.push({ type: 'paren', value: LEFT_PAREN });
      current++;
      continue;
    }
    if (char === RIGHT_PAREN) {
      tokens.push({ type: 'paren', value: RIGHT_PAREN });
      current++;
      continue;
    }
    if (NUM_RE.test(char)) {
      let value = '';
      while (NUM_RE.test(char)) {
        value += char;
        char = input[++current];
      }
      tokens.push({ type: 'number', value });
      continue;
    }
    if (char === '+') {
      tokens.push({ type: 'name', value: ADD });
      current++;
      continue;
    }
    if (char === '-') {
      tokens.push({ type: 'name', value: SUBTRACT });
      current++;
      continue;
    }
    if (WHITESPACE.test(char)) {
      current++;
      continue;
    }
  }
  return tokens;
}

const input = '1 +(2 +  31 -4) + 5';

const tokens = tokenizer(input);

type NumberLiteral = {
  type: 'NumberLiteral';
  value: string;
};

type CallExpression = {
  type: 'CallExpression';
  name: NameValue;
  params: (NumberLiteral | CallExpression)[];
};

type Program = {
  type: 'program';
  body: (CallExpression | NumberLiteral)[];
};

// `1 +(2 +  31 -4) + 5` => add(1, subtract(add(2, 31), 4), 5)

//

// {
//   type: 'program',
//   body: [
//     {
//       type: 'CallExpression',
//       name: 'add',
//       params: [
//         { type: 'NumberLiteral', value: '1' },
//         {
//           type: 'CallExpression',
//           name: 'subtract',
//           params: [
//             {
//               type: 'CallExpression',
//               name: 'add',
//               params: [
//                 { type: 'NumberLiteral', value: '2' },
//                 { type: 'NumberLiteral', value: '31' },
//               ],
//             },
//             { type: 'NumberLiteral', value: '4' },
//           ],
//         },
//         { type: 'NumberLiteral', value: '5' },
//       ],
//     },
//   ],
// };

function parser(tokens: Token[]): Program {
  // function walk(): NumberLiteral | CallExpression {
  //   const token = tokens[current];
  //   if (token.type === 'number') {
  //     const numberLiteral: NumberLiteral = {
  //       type: 'NumberLiteral',
  //       value: token.value,
  //     };

  //     // should be `add`, `subtract` or `left paren`
  //     const next = tokens[++current];

  //     if (next.type === 'name') {
  //       if (currentExpression && currentExpression.name === next.value) {
  //         // 1 + 2 : add(1, 2) => 1 + 2 + 3 : add(1, 2, 3)
  //         // 5 - 2 : subtract(5, 2) => 5 - 2 - 1 : subtract(5, 2, 1)
  //         if (currentExpression.name === next.value) {
  //           currentExpression.params.push(numberLiteral);
  //           return currentExpression;
  //         }

  //         // 1 + 2 : add(1, 2) => 1 + 2 - 3 : subtract(add(1, 2), 3)
  //         let expression: CallExpression = {
  //           type: 'CallExpression',
  //           name: next.value,
  //           params: [currentExpression, numberLiteral],
  //         };
  //         currentExpression = expression;
  //         return expression;
  //       }
  //       let expression: CallExpression = {
  //         type: 'CallExpression',
  //         name: next.value,
  //         params: [numberLiteral],
  //       };
  //       currentExpression = expression;
  //       return expression;
  //     } else if (next.type === 'paren') {
  //       //
  //       // let expression: CallExpression = {
  //       //   type: 'CallExpression',
  //       //   name: ADD,
  //       //   params: [numberLiteral],
  //       // }
  //       if (next.value === LEFT_PAREN) {
  //         // skip left paren
  //         current++;
  //         if (currentExpression) {
  //           currentExpression.params.push(walk());
  //         }
  //       }
  //     }

  //     throw new TypeError('Unknown token type: ' + next.type);
  //   }

  //   if (token.type === 'name') {
  //     let node: CallExpression = {
  //       type: 'CallExpression',
  //       name: token.value,
  //       params: [],
  //     };
  //     return node;
  //   }

  //   throw new TypeError('Unknown token type: ' + token.type);
  // }

  const ast: Program = {
    type: 'program',
    body: [],
  };

  let leftNumberOrExpression: NumberLiteral | CallExpression | null = null;
  let currentExpression: CallExpression | null = null;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type === 'name') {
      let expression: CallExpression = {
        type: 'CallExpression',
        name: token.value,
        params: [],
      };
      if (leftNumberOrExpression) {
        expression.params.push(leftNumberOrExpression);
      }
      if (!currentExpression) {
        currentExpression = expression;
        ast.body.push(expression);
      }
    } else if (token.type === 'number') {
      let numberLiteral: NumberLiteral = {
        type: 'NumberLiteral',
        value: token.value,
      };
      if (currentExpression) {
        currentExpression.params.push(numberLiteral);
      }
      leftNumberOrExpression = numberLiteral;
    }
  }

  return ast;
}

// const program: Program = {
//   type: 'program',
//   body: [
//     {
//       type: 'CallExpression',
//       name: ADD,
//       params: [
//         { type: 'NumberLiteral', value: '1' },
//         { type: 'NumberLiteral', value: '2' },
//         { type: 'NumberLiteral', value: '3' },
//       ],
//     },
//   ],
// };
const myTokens = tokenizer('1 + 2 + 3');
const ast = parser(myTokens);

console.log(JSON.stringify(ast, null, 2));
