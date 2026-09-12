// src/components/figures/FigureCard.jsx
export default function FigureCard({ figure }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col justify-between">
      <div className="relative aspect-3/4 bg-slate-100 overflow-hidden">
        {figure.imageUrl ? (
          <img
            src={figure.imageUrl}
            alt={figure.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
        )}
        <span className="absolute top-3 right-3 bg-purple-600/90 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full">
          {figure.scale || 'N/A'}
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">
            {figure.series || 'Series'}
          </p>
          <h3 className="font-bold text-slate-800 line-clamp-1 text-base">{figure.name}</h3>
          <p className="text-xs text-slate-500 mt-1">{figure.manufacturer || 'Unknown Studio'}</p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">ราคา</span>
            <span className="font-bold text-slate-900">฿{Number(figure.price || 0).toLocaleString()}</span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 font-medium">
            {figure.status || 'Owned'}
          </span>
        </div>
      </div>
    </div>
  );
}