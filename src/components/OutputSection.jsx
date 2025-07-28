import React from 'react';
import { Copy } from 'lucide-react';
const OutputSection = ({ output }) => (
    <div className="mt-6 bg-gray-50 p-4 rounded">
        <div className="flex justify-between mb-2"><h3 className="font-semibold">Generated Confirmations</h3><button onClick={()=>navigator.clipboard.writeText(output)} className="text-gray-600"><Copy /></button></div>
        <pre className="whitespace-pre-wrap font-mono text-sm">{output}</pre>
    </div>
);
export default OutputSection;