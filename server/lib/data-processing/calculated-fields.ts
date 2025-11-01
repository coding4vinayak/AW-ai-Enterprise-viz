
export interface CalculatedField {
  name: string;
  formula: string;
  type: 'number' | 'string' | 'boolean';
}

export class CalculatedFieldsEngine {
  static applyCalculatedFields(data: any[], fields: CalculatedField[]): any[] {
    return data.map(row => {
      const newRow = { ...row };
      
      fields.forEach(field => {
        try {
          newRow[field.name] = this.evaluateFormula(field.formula, row);
        } catch (error) {
          console.error(`Error evaluating formula for ${field.name}:`, error);
          newRow[field.name] = null;
        }
      });
      
      return newRow;
    });
  }

  private static evaluateFormula(formula: string, row: any): any {
    // Replace field references with actual values
    let processedFormula = formula;
    
    // Find all field references in the format {fieldName}
    const fieldMatches = formula.match(/\{([^}]+)\}/g);
    if (fieldMatches) {
      fieldMatches.forEach(match => {
        const fieldName = match.slice(1, -1);
        const value = row[fieldName];
        processedFormula = processedFormula.replace(match, String(value ?? 0));
      });
    }
    
    // Evaluate the formula safely
    try {
      // Only allow mathematical operations and basic functions
      const allowedOperations = /^[\d+\-*/(). ]+$/;
      if (!allowedOperations.test(processedFormula)) {
        throw new Error('Invalid formula');
      }
      
      return Function(`"use strict"; return (${processedFormula})`)();
    } catch (error) {
      throw new Error(`Formula evaluation failed: ${error}`);
    }
  }

  static validateFormula(formula: string, sampleRow: any = {}): { valid: boolean; error?: string } {
    try {
      // Check if formula contains field references
      const fieldMatches = formula.match(/\{([^}]+)\}/g);
      if (fieldMatches && Object.keys(sampleRow).length === 0) {
        return { valid: false, error: 'No data available to validate formula' };
      }
      
      this.evaluateFormula(formula, sampleRow);
      return { valid: true };
    } catch (error: any) {
      return { valid: false, error: error.message };
    }
  }
}
