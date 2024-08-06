import vm from 'vm';

export async function executeFunction(
  functionBody: string,
  ...args: any[]
): Promise<any> {
  try {
    // Create a new context
    const context: vm.Context = {
      console: console,
      // Add other global variables or functions as needed
    };

    // Wrap the function string in an immediately invoked function expression (IIFE)
    // that accepts parameters
    const wrappedFunction = `
        (async function(...args) { 
          const func = function(${functionBody});
          return func(...args);
        })(...${JSON.stringify(args)})
      `;

    // Execute the function in a sandboxed environment
    const result = await vm.runInNewContext(wrappedFunction, context);

    return result;
  } catch (error) {
    console.error('Error executing custom function:', error);
    throw new Error('Failed to execute custom function');
  }
}
