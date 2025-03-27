'use client';

export default function NeimaExample() {
  return (
    <div className="space-y-8 p-8">
      <h1 className="text-4xl font-neima text-white">
        This is using the Neima Font
      </h1>
      
      <p className="text-xl font-neima text-white">
        This paragraph also uses the Neima font with Tailwind
      </p>
      
      <div className="flex space-x-4">
        <button className="px-6 py-3 bg-secondary rounded font-neima text-lg">
          Neima Button
        </button>
        
        <button className="px-6 py-3 bg-primary rounded font-morion text-lg">
          Morion Button (for comparison)
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border border-gray-700 rounded">
          <h3 className="font-neima text-2xl text-white mb-2">Neima Heading</h3>
          <p className="font-neima text-gray-300">
            This card uses the Neima font for all text elements, showing how it looks in a UI component.
          </p>
        </div>
        
        <div className="p-4 border border-gray-700 rounded">
          <h3 className="font-morion text-2xl text-white mb-2">Morion Heading</h3>
          <p className="font-morion text-gray-300">
            This card uses the Morion font for comparison with Neima.
          </p>
        </div>
      </div>
    </div>
  );
} 