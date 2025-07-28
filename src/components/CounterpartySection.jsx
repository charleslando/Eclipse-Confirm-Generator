import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
const CounterpartySection = ({ title, list, setList }) => {
    const add = () => setList([...list, { name:'', quantity:100 }]);
    const remove = i => setList(list.filter((_,j)=>j!==i));
    const update = (i,f,v) => { const u=[...list]; u[i][f]=v; setList(u); };
    return (
        <div className="bg-gray-50 p-4 rounded">
            <div className="flex justify-between mb-2"><h3 className="font-semibold">{title}</h3><button onClick={add} className="text-green-600"><Plus /></button></div>
            {list.map((c,i)=>(
                <div key={i} className="flex items-center gap-2 mb-2">
                    <input className="flex-1 p-1 border rounded" placeholder={`${title.slice(0,-1)} name`} value={c.name} onChange={e=>update(i,'name',e.target.value)} />
                    <input type="number" className="w-20 p-1 border rounded" value={c.quantity} onChange={e=>update(i,'quantity',parseInt(e.target.value,10)||0)} />
                    <button onClick={()=>remove(i)} className="text-red-600"><Trash2 /></button>
                </div>
            ))}
        </div>
    );
};
export default CounterpartySection;