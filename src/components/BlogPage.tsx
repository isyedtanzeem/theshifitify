import React, { useEffect } from 'react';
import { BookOpen, Calendar, ArrowRight, Clock, ShieldCheck } from 'lucide-react';
import { updatePageSEO } from '../utils/seo';

interface BlogPageProps {
  onOpenQuoteModal: () => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ onOpenQuoteModal }) => {
  useEffect(() => {
    updatePageSEO({
      title: 'Moving Tips & Packing Guides | Shiftify Packers & Movers Blog',
      description: 'Expert moving tips, apartment society shifting checklists, and vehicle relocation guides for Bangalore and intercity moves.',
      canonicalPath: '/blog',
    });
  }, []);

  const articles = [
    {
      title: 'Complete 7-Day Moving Checklist for Bangalore Apartments',
      slug: 'bangalore-apartment-moving-checklist',
      date: 'Aug 28, 2026',
      readTime: '4 min read',
      excerpt:
        'A step-by-step checklist to coordinate society gate passes, elevator padding permissions, and utility address changes before moving day.',
      category: 'House Shifting',
    },
    {
      title: 'How to Safely Transport Cars and Two-Wheelers Across States',
      slug: 'how-to-transport-vehicles-intercity-india',
      date: 'Aug 14, 2026',
      readTime: '5 min read',
      excerpt:
        'Everything you need to know about RC documentation, fuel reserves, insurance coverage, and enclosed car carriers for interstate transit.',
      category: 'Vehicle Transport',
    },
    {
      title: 'Planning a Zero-Downtime Office Relocation in Bangalore',
      slug: 'zero-downtime-office-relocation-bangalore',
      date: 'Jul 29, 2026',
      readTime: '6 min read',
      excerpt:
        'Best practices for IT asset tagging, server rack unbolting, employee desk numbering, and weekend shifting execution for tech companies.',
      category: 'Commercial Moving',
    },
  ];

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen py-10 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Moving Guides & Relocation Tips</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-slate-900">
            Shiftify Relocation Blog
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            Practical advice to help you pack efficiently, protect valuables, and navigate city society rules.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {articles.map((art, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-orange-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                    {art.category}
                  </span>
                  <span>{art.readTime}</span>
                </div>
                <h2 className="text-base font-bold text-slate-900 font-display hover:text-orange-600 transition-colors">
                  {art.title}
                </h2>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {art.excerpt}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{art.date}</span>
                </span>
                <button
                  onClick={onOpenQuoteModal}
                  className="font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  <span>Get Quote</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
