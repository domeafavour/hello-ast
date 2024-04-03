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

type Wrapper = {
  name: NameValue | null;
  params: CallExpression['params'];
  parent: Wrapper | null;
};

function parser(tokens: Token[]): Program {
  const ast: Program = {
    type: 'program',
    body: [],
  };

  let wrapper: Wrapper = {
    name: null,
    params: [],
    parent: null,
  };

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type === 'name') {
      // new wrapper
      let expression: CallExpression = {
        type: 'CallExpression',
        name: token.value,
        params: wrapper.params,
      };
      if (!wrapper.name) {
        ast.body.push(expression);
        wrapper.params = expression.params;
        wrapper.name = expression.name;
      }
    } else if (token.type === 'number') {
      let numberLiteral: NumberLiteral = {
        type: 'NumberLiteral',
        value: token.value,
      };
      wrapper.params.push(numberLiteral);
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
// const myTokens = tokenizer('1 + 2 + 3');
// const ast = parser(myTokens);

// const program: Program = {
//   type: 'program',
//   body: [
//     {
//       type: 'CallExpression',
//       name: ADD,
//       params: [
//         { type: 'NumberLiteral', value: '1' },
//         {
//           type: 'CallExpression',
//           name: ADD,
//           params: [
//             { type: 'NumberLiteral', value: '2' },
//             { type: 'NumberLiteral', value: '3' },
//           ],
//         },
//       ],
//     },
//   ],
// };
const myTokens = tokenizer('1 + (2 + 3)');
const ast = parser(myTokens);

console.log(JSON.stringify(ast, null, 2));
