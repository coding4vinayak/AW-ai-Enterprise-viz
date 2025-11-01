
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, X, CheckCircle, AlertCircle } from 'lucide-react';

interface CalculatedField {
  name: string;
  formula: string;
  type: 'number' | 'string' | 'boolean';
}

interface CalculatedFieldBuilderProps {
  datasetId: string;
  columns: string[];
  onSave: (fields: CalculatedField[]) => void;
}

export function CalculatedFieldBuilder({ datasetId, columns, onSave }: CalculatedFieldBuilderProps) {
  const [fields, setFields] = useState<CalculatedField[]>([]);
  const [currentField, setCurrentField] = useState<CalculatedField>({
    name: '',
    formula: '',
    type: 'number'
  });
  const [validationResult, setValidationResult] = useState<{ valid: boolean; error?: string } | null>(null);

  const validateFormula = async () => {
    if (!currentField.name.trim()) {
      setValidationResult({ valid: false, error: 'Field name cannot be empty' });
      return;
    }
    
    if (!currentField.formula.trim()) {
      setValidationResult({ valid: false, error: 'Formula cannot be empty' });
      return;
    }
    
    // Check for duplicate field names
    if (fields.some(f => f.name === currentField.name)) {
      setValidationResult({ valid: false, error: 'Field name already exists' });
      return;
    }
    
    // Basic validation - check if formula references valid columns
    const columnRefs = currentField.formula.match(/\{([^}]+)\}/g) || [];
    const invalidColumns = columnRefs
      .map(ref => ref.replace(/[{}]/g, ''))
      .filter(col => !columns.includes(col));
    
    if (invalidColumns.length > 0) {
      setValidationResult({ 
        valid: false, 
        error: `Invalid columns: ${invalidColumns.join(', ')}` 
      });
      return;
    }
    
    // Check for basic operators
    const validOperators = /^[0-9a-zA-Z{}+\-*/().\s]+$/;
    if (!validOperators.test(currentField.formula)) {
      setValidationResult({ 
        valid: false, 
        error: 'Formula contains invalid characters' 
      });
      return;
    }
    
    setValidationResult({ valid: true });
  };

  const addField = () => {
    if (currentField.name && currentField.formula && validationResult?.valid) {
      setFields([...fields, currentField]);
      setCurrentField({ name: '', formula: '', type: 'number' });
      setValidationResult(null);
    }
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const insertColumn = (column: string) => {
    setCurrentField({
      ...currentField,
      formula: currentField.formula + `{${column}}`
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calculated Fields</CardTitle>
        <CardDescription>Create custom metrics from your data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Fields */}
        {fields.length > 0 && (
          <div className="space-y-2">
            <Label>Created Fields</Label>
            {fields.map((field, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <span className="font-medium">{field.name}</span>
                  <span className="text-sm text-muted-foreground ml-2">{field.formula}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeField(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Available Columns */}
        <div>
          <Label>Available Columns (click to insert)</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {columns.map(column => (
              <Badge 
                key={column} 
                variant="outline" 
                className="cursor-pointer hover:bg-accent"
                onClick={() => insertColumn(column)}
              >
                {column}
              </Badge>
            ))}
          </div>
        </div>

        {/* New Field Form */}
        <div className="space-y-4 border-t pt-4">
          <div>
            <Label>Field Name</Label>
            <Input
              value={currentField.name}
              onChange={(e) => setCurrentField({ ...currentField, name: e.target.value })}
              placeholder="e.g., profit_margin"
            />
          </div>

          <div>
            <Label>Formula</Label>
            <Input
              value={currentField.formula}
              onChange={(e) => setCurrentField({ ...currentField, formula: e.target.value })}
              placeholder="e.g., ({revenue} - {cost}) / {revenue}"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use {'{column_name}'} to reference columns. Supports +, -, *, /, ()
            </p>
          </div>

          {validationResult && (
            <div className={`flex items-center gap-2 p-2 rounded ${
              validationResult.valid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {validationResult.valid ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Formula is valid</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{validationResult.error}</span>
                </>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={validateFormula} variant="outline">
              Validate
            </Button>
            <Button 
              onClick={addField} 
              disabled={!currentField.name || !currentField.formula || !validationResult?.valid}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          </div>
        </div>

        {fields.length > 0 && (
          <Button onClick={() => onSave(fields)} className="w-full">
            Apply Calculated Fields
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
