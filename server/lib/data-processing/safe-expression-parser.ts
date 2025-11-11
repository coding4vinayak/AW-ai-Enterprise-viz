
export class SafeExpressionParser {
  static evaluate(expression: string): any {
    try {
      return this.parse(expression);
    } catch (error) {
      throw new Error(`Invalid expression: ${error}`);
    }
  }

  private static parse(expression: string): any {
    const tokens = this.tokenize(expression);
    const rpn = this.shuntingYard(tokens);
    return this.evaluateRPN(rpn);
  }

  private static tokenize(expression: string): (string | number)[] {
    const regex = /\d+\.?\d*|\+|\-|\*|\/|\(|\)/g;
    return expression.match(regex) || [];
  }

  private static shuntingYard(tokens: (string | number)[]): (string | number)[] {
    const output: (string | number)[] = [];
    const operators: string[] = [];
    const precedence: { [key: string]: number } = { '+': 1, '-': 1, '*': 2, '/': 2 };

    for (const token of tokens) {
      if (typeof token === 'number' || !isNaN(Number(token))) {
        output.push(Number(token));
      } else if (token in precedence) {
        while (
          operators.length > 0 &&
          operators[operators.length - 1] !== '(' &&
          precedence[operators[operators.length - 1]] >= precedence[token]
        ) {
          output.push(operators.pop()!);
        }
        operators.push(token);
      } else if (token === '(') {
        operators.push(token);
      } else if (token === ')') {
        while (operators.length > 0 && operators[operators.length - 1] !== '(') {
          output.push(operators.pop()!);
        }
        if (operators[operators.length - 1] === '(') {
          operators.pop();
        } else {
          throw new Error('Mismatched parentheses');
        }
      }
    }

    while (operators.length > 0) {
      if (operators[operators.length - 1] === '(') {
        throw new Error('Mismatched parentheses');
      }
      output.push(operators.pop()!);
    }

    return output;
  }

  private static evaluateRPN(rpn: (string | number)[]): number {
    const stack: number[] = [];

    for (const token of rpn) {
      if (typeof token === 'number') {
        stack.push(token);
      } else {
        const b = stack.pop();
        const a = stack.pop();

        if (a === undefined || b === undefined) {
          throw new Error('Invalid expression');
        }

        switch (token) {
          case '+':
            stack.push(a + b);
            break;
          case '-':
            stack.push(a - b);
            break;
          case '*':
            stack.push(a * b);
            break;
          case '/':
            stack.push(a / b);
            break;
        }
      }
    }

    if (stack.length !== 1) {
      throw new Error('Invalid expression');
    }

    return stack[0];
  }
}
