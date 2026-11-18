import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, User, Tag, ChevronRight, Search, BookOpen, Layers } from "lucide-react";
import Navbar from "../frontend/Navbar";
import Footer from "../frontend/Footer";
import blogs from "../../data/blogsData";

const topicFilters = [
  { id: "all",        label: "All",            keywords: [] },
  { id: "itr",        label: "ITR Filing",     keywords: ["itr", "income tax return", "filing", "assessment year", "ay 2026", "itr-1", "itr-2", "itr-3", "itr-4", "form 26as", "ais"] },
  { id: "pan-card",   label: "PAN Card",       keywords: ["pan card", "permanent account number"] },
  { id: "application",label: "Application",   keywords: ["apply", "application", "online", "new pan"] },
  { id: "individual", label: "Individual",     keywords: ["individual", "students", "minor", "salaried", "freelancer"] },
  { id: "business",   label: "Business & LLP", keywords: ["partnership", "llp", "firm", "business", "gst"] },
  { id: "company",    label: "Company",        keywords: ["company", "private limited", "public limited", "director"] },
  { id: "correction", label: "Correction",     keywords: ["correction", "update", "name change", "mismatch"] },
  { id: "pan-2",      label: "PAN 2.0",        keywords: ["pan 2.0", "qr", "e-pan", "upgrade"] },
];

const getSearchText = (blog) =>
  [
    blog.title,
    blog.category,
    blog.excerpt,
    Array.isArray(blog.content) ? blog.content.join(" ") : blog.content,
    ...(blog.tags || []),
  ]
    .join(" ")
    .toLowerCase();

const matchesTopic = (blog, topic) => {
  if (topic.id === "all") return true;
  const searchText = getSearchText(blog);
  return topic.keywords.some((keyword) => searchText.includes(keyword));
};

const getTopicsForBlog = (blog) =>
  topicFilters
    .filter((topic) => topic.id !== "all" && matchesTopic(blog, topic))
    .slice(0, 3);

const BlogList = () => {
  const [activeTopic, setActiveTopic] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const activeTopicConfig = topicFilters.find((topic) => topic.id === activeTopic) || topicFilters[0];
  const featuredBlog = blogs[0];

  const topicCounts = useMemo(
    () =>
      topicFilters.reduce((counts, topic) => {
        counts[topic.id] = blogs.filter((blog) => matchesTopic(blog, topic)).length;
        return counts;
      }, {}),
    [],
  );

  const filtered = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return blogs.filter((blog) => {
      const matchesSelectedTopic = matchesTopic(blog, activeTopicConfig);
      const matchesSearch = !normalizedSearch || getSearchText(blog).includes(normalizedSearch);
      return matchesSelectedTopic && matchesSearch;
    });
  }, [activeTopicConfig, searchTerm]);

  return (
    <>
      <Navbar />

      <main className="bg-slate-50 min-h-screen">
        <div className="bg-gradient-to-br from-slate-900 to-blue-900 text-white py-14 sm:py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <span className="inline-block bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
              Resources
            </span>
            <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-end">
              <div>
                <h1 className="text-3xl sm:text-5xl font-bold mb-4 leading-tight">Blog &amp; Insights</h1>
                <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-7">
                  Expert articles on tax filing, GST, business registration, and compliance, written by our CA and CS professionals.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <BookOpen size={20} className="text-blue-300 mb-2" />
                  <p className="text-2xl font-bold">{blogs.length}</p>
                  <p className="text-xs text-slate-300">Articles</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <Layers size={20} className="text-blue-300 mb-2" />
                  <p className="text-2xl font-bold">{topicFilters.length - 1}</p>
                  <p className="text-xs text-slate-300">Topics</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          {/* {featuredBlog && (
            <Link
              to={`/blog/${featuredBlog.id}`}
              className="group mb-8 grid lg:grid-cols-[1.2fr_0.8fr] gap-0 overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/10 transition-all"
            >
              <div className="p-6 sm:p-8">
                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                  <BookOpen size={12} />
                  Featured Guide
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 leading-tight mb-4 group-hover:text-blue-700 transition-colors">
                  {featuredBlog.title}
                </h2>
                <p className="text-slate-600 text-sm sm:text-base leading-7 line-clamp-3">
                  {featuredBlog.excerpt}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <User size={13} />
                    {featuredBlog.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} />
                    {featuredBlog.readTime}
                  </span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-600 to-slate-900 p-6 sm:p-8 text-white flex flex-col justify-between">
                <div className="flex flex-wrap gap-2">
                  {getTopicsForBlog(featuredBlog).map((topic) => (
                    <span key={topic.id} className="rounded-full bg-white/15 border border-white/15 px-3 py-1 text-xs font-semibold">
                      {topic.label}
                    </span>
                  ))}
                </div>
                <div className="mt-10 flex items-center justify-between text-sm font-semibold text-blue-100">
                  Read article
                  <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          )} */}

          <div className="mb-8 rounded-2xl bg-white border border-slate-100 shadow-sm p-4 sm:p-5">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
              <div className="relative flex-1">
                <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search articles..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>
              <p className="text-sm text-slate-500 shrink-0">
                Showing <span className="font-bold text-slate-900">{filtered.length}</span> articles
              </p>
            </div>

            <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
              {topicFilters.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => setActiveTopic(topic.id)}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    activeTopic === topic.id
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                      : "bg-slate-50 text-slate-600 border border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  {topic.label}
                  <span className={`ml-2 text-xs ${activeTopic === topic.id ? "text-blue-100" : "text-slate-400"}`}>
                    {topicCounts[topic.id] || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-950">{activeTopicConfig.label} Articles</h2>
              <p className="text-sm text-slate-500 mt-1">
                Browse guides grouped from the existing article content.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((blog) => (
              <Link
                key={blog.id}
                to={`/blog/${blog.id}`}
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/10 hover:-translate-y-1 transition-all duration-200 flex flex-col overflow-hidden"
              >
                <div className="h-1.5 bg-gradient-to-r from-blue-600 via-blue-400 to-slate-300" />
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {getTopicsForBlog(blog).map((topic) => (
                      <span
                        key={topic.id}
                        className="inline-block bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-full w-fit"
                      >
                        {topic.label}
                      </span>
                    ))}
                  </div>

                  <h2 className="text-slate-900 font-bold text-lg leading-snug mb-3 line-clamp-2 group-hover:text-blue-700 transition-colors">
                    {blog.title}
                  </h2>

                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 flex-1">
                    {blog.excerpt}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {blog.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 text-xs text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full transition-colors group-hover:border-blue-100 group-hover:text-blue-500"
                      >
                        <Tag size={10} />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <User size={12} />
                      {blog.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {blog.readTime}
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-blue-400 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 text-slate-500">
              No articles found for this topic or search.
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default BlogList;
