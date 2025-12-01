"use client";

import { useState, useRef, useEffect } from "react";
import { X, Plus, Check, Calculator as CalculatorIcon, Trash2 } from "lucide-react";

interface CalculatorItem {
  id: string;
  name: string;
  price: number;
}

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish: (total: number, count: number, items: CalculatorItem[]) => void;
  initialItems: CalculatorItem[];
}

export function CalculatorModal({ isOpen, onClose, onFinish, initialItems }: CalculatorModalProps) {
  const [amount, setAmount] = useState("");
  const [items, setItems] = useState<CalculatorItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setItems(initialItems || []); // Initialize with passed items
      // Focus input when modal opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      // Reset state when closed
      setAmount("");
      setItems([]);
    }
  }, [isOpen, initialItems]);

  const handleAddItem = (e?: React.FormEvent) => {
    e?.preventDefault();
    const val = parseFloat(amount);
    if (!isNaN(val) && val > 0) {
      setItems([
        ...items, 
        { 
          id: Date.now().toString(), 
          name: "Товар", 
          price: val 
        }
      ]);
      setAmount("");
      inputRef.current?.focus();
    }
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleNameChange = (index: number, newName: string) => {
    const newItems = [...items];
    newItems[index].name = newName;
    setItems(newItems);
  };

  const handleFinish = () => {
    const total = items.reduce((sum, item) => sum + item.price, 0);
    onFinish(total, items.length, items);
    onClose();
  };

  if (!isOpen) return null;

  const totalSum = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800 scale-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-indigo-600 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2 font-bold text-lg">
            <CalculatorIcon size={24} />
            Калькулятор суммы
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-indigo-500 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Input Area */}
          <form onSubmit={handleAddItem} className="flex gap-3">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Введите сумму товара"
                className="w-full pl-4 pr-4 py-3 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={!amount}
              className="px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <Plus size={24} />
            </button>
          </form>

          {/* List Area */}
          <div className="bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-4 h-64 overflow-y-auto">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
                <CalculatorIcon size={48} className="mb-2 opacity-50" />
                <p>Список пуст</p>
                <p className="text-xs">Добавьте стоимость товаров</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {items.map((item, index) => (
                  <li key={item.id} className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom-2 duration-200">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleNameChange(index, e.target.value)}
                        className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none w-full text-slate-700 dark:text-slate-300 text-sm py-0.5 transition-colors"
                        placeholder="Название товара"
                      />
                    </div>
                    <div className="flex items-center gap-3 pl-3 shrink-0">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {item.price.toLocaleString("ru-RU")} ₽
                      </span>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer / Total */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
             <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Итого товаров: {items.length}</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {totalSum.toLocaleString("ru-RU")} ₽
                </p>
             </div>
             <button
                onClick={handleFinish}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium shadow-lg shadow-emerald-500/20"
             >
                <Check size={20} />
                Закончить
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
