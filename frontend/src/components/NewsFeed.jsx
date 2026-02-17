import { useEffect, useState } from "react";
import api from "../lib/api";

export default function NewsFeed({ symbol }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const params = symbol ? `?symbol=${symbol}&limit=10` : "?limit=10";
        const res = await api.get(`/news${params}`);
        setArticles(res.data.articles || []);
      } catch {
        setArticles([]);
      }
      setLoading(false);
    };
    fetchNews();
  }, [symbol]);

  if (loading) {
    return (
      <div className="bg-[#0f1629] rounded-xl border border-slate-800/60 p-6">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">Market News</h3>
        <p className="text-sm text-slate-500">Loading news...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0f1629] rounded-xl border border-slate-800/60 p-4 md:p-6">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">Market News</h3>
      {articles.length === 0 ? (
        <p className="text-sm text-slate-500">No news available</p>
      ) : (
        <div className="space-y-3">
          {articles.map((article, i) => (
            <a
              key={i}
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-lg hover:bg-slate-800/50 transition group"
            >
              <p className="text-sm text-white group-hover:text-blue-400 transition font-medium line-clamp-2">
                {article.title}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">{article.source}</span>
                {article.published && (
                  <span className="text-[10px] text-slate-500">{article.published}</span>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
