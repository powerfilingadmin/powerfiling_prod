import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Clock, Tag, ArrowLeft, ChevronRight, User, CalendarDays, Link2, ArrowUp } from "lucide-react";
import { Helmet } from "react-helmet-async";
import Navbar from "../frontend/Navbar";
import Footer from "../frontend/Footer";
import blogs from "../../data/blogsData";
import ScrollAdModal from "../../components/ScrollAdModal";

const BlogDetail = () => {
  const { id } = useParams();
  const blog = blogs.find((b) => b.id === id);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  // Show announcement bar after 3 seconds
  useEffect(() => {
    const t = setTimeout(() => setShowBanner(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const slugify = (value) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  const headings = useMemo(() => {
    if (!blog?.content) return [];
    return blog.content
      .split("\n\n")
      .filter((para) => para.startsWith("**") && para.endsWith("**"))
      .map((para) => {
        const title = para.replace(/\*\*/g, "");
        return { id: slugify(title), title };
      });
  }, [blog?.content]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(100, Math.round((scrollTop / docHeight) * 100)) : 0;
      setReadingProgress(progress);
      setShowScrollTop(scrollTop > 300);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!blog) {
    return (
      <>
        <Navbar />
        <main className="bg-slate-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Article not found</h1>
            <p className="text-slate-500 mb-6">The article you're looking for doesn't exist.</p>
            <Link to="/blog" className="text-blue-600 hover:underline font-medium">
              ← Back to Blog
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Render inline content: bold **text** and [text](url) hyperlinks
  const renderInline = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
    return parts.map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={j} className="text-slate-900 font-semibold">
            {part.replace(/\*\*/g, "")}
          </strong>
        );
      }
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        return (
          <a key={j} href={linkMatch[2]} target="_blank" rel="noopener noreferrer"
            className="text-blue-600 hover:underline font-medium">
            {linkMatch[1]}
          </a>
        );
      }
      return part;
    });
  };

  // Render content: bold **text**, [links](url), bullet lists, tables and paragraphs
  const renderContent = (text) => {
    return text.split("\n\n").map((para, i) => {
      if (!para.trim()) return null;

      // Section heading (starts with **)
      if (para.startsWith("**") && para.endsWith("**")) {
        const title = para.replace(/\*\*/g, "");
        const headingId = slugify(title);
        return (
          <h2
            key={i}
            id={headingId}
            className="group scroll-mt-28 text-xl sm:text-2xl text-slate-950 font-bold mt-10 mb-4 leading-tight"
          >
            <a
              href={`#${headingId}`}
              className="inline-flex items-center gap-2 rounded-lg -ml-2 px-2 py-1 transition-all hover:bg-blue-50 hover:text-blue-700"
            >
              <span className="h-7 w-1 rounded-full bg-blue-600 opacity-80 transition-all group-hover:h-9" />
              <span>{title}</span>
              <Link2 size={16} className="text-blue-400 opacity-0 transition-opacity group-hover:opacity-100" />
            </a>
          </h2>
        );
      }

      // Image ![alt](url)
      if (para.startsWith("![")) {
        const imgMatch = para.match(/!\[([^\]]*)\]\(([^)]+)\)/);
        if (imgMatch) {
          return (
            <div key={i} className="my-8 flex justify-center">
              <img
                src={imgMatch[2]}
                alt={imgMatch[1]}
                className="rounded-2xl border border-slate-200 shadow-sm max-w-full transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/10 hover:-translate-y-1"
              />
            </div>
          );
        }
      }

      // Table (lines starting with |)
      if (para.startsWith("| ") || para.startsWith("|")) {
        const rows = para.split("\n").filter(line => line.trim() && !line.match(/^\|[-| ]+\|$/));
        const headers = rows[0].split("|").filter(c => c.trim()).map(c => c.trim());
        const bodyRows = rows.slice(1);
        return (
          <div key={i} className="my-7 overflow-x-auto rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  {headers.map((h, j) => (
                    <th key={j} className="text-left px-4 py-3 font-bold text-slate-800 bg-blue-50 text-xs uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, j) => {
                  const cells = row.split("|").filter(c => c.trim()).map(c => c.trim());
                  return (
                    <tr key={j} className={`border-b border-slate-100 transition-colors hover:bg-blue-50/60 ${j % 2 === 1 ? "bg-slate-50" : "bg-white"}`}>
                      {cells.map((cell, k) => (
                        <td key={k} className="px-4 py-3 text-slate-700 font-medium text-xs sm:text-sm">
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      }

      // Bullet list (lines starting with -)
      if (para.includes("\n- ") || para.startsWith("- ")) {
        const lines = para.split("\n");
        return (
          <ul key={i} className="space-y-2.5 my-5">
            {lines.map((line, j) => {
              if (line.startsWith("- ")) {
                return (
                  <li key={j} className="group flex gap-3 text-slate-700 text-[15px] leading-7 rounded-xl px-3 py-2 transition-all hover:bg-blue-50 hover:text-slate-950">
                    <span className="mt-3 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 transition-transform group-hover:scale-125" />
                    <span>{renderInline(line.slice(2))}</span>
                  </li>
                );
              }
              return (
                <p key={j} className="text-slate-700 text-[15px] leading-7 font-medium mb-1 rounded-xl border-l-2 border-transparent px-3 py-2 transition-all hover:border-blue-500 hover:bg-slate-50">
                  {renderInline(line)}
                </p>
              );
            })}
          </ul>
        );
      }

      return (
        <p key={i} className="text-slate-700 text-[15px] sm:text-base leading-8 my-4 rounded-xl border-l-2 border-transparent px-3 py-2 transition-all hover:border-blue-500 hover:bg-slate-50 hover:text-slate-950">
          {renderInline(para)}
        </p>
      );
    });
  };

  const related = blogs.filter((b) => b.id !== blog.id && b.category === blog.category).slice(0, 2);

  return (
    <>
      <Helmet>
        <title>{blog.metaTitle || blog.title}</title>
        <meta name="description" content={blog.metaDescription || blog.excerpt} />
        <meta property="og:title" content={blog.metaTitle || blog.title} />
        <meta property="og:description" content={blog.metaDescription || blog.excerpt} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={blog.metaTitle || blog.title} />
        <meta name="twitter:description" content={blog.metaDescription || blog.excerpt} />
      </Helmet>
      <Navbar />

      {/* Announcement bar — slides in after 3 seconds */}
      <div
        className={`bg-slate-900 text-white overflow-hidden transition-all duration-700 ease-out ${
          showBanner ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5">
          {/* Left text */}
          <p className="text-sm sm:text-base font-medium text-slate-200 text-center sm:text-left">
            📅 Deadline for revised ITR 3 & 4 is{" "}
            <strong className="text-white text-base sm:text-lg">31st August</strong>{" "}
            — Don't miss it!
          </p>

          {/* Divider */}
          <span className="hidden sm:block w-px h-6 bg-slate-600" />

          {/* CTA button */}
          <Link
            to="/services/individual"
            className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold px-6 py-2 rounded-full text-sm transition-all whitespace-nowrap shadow-lg shadow-blue-900/40"
          >
            File Now
          </Link>

          {/* Divider */}
          <span className="hidden sm:block w-px h-6 bg-slate-600" />

          {/* Phone */}
          <p className="text-sm text-slate-300 text-center">
            To Book a CA —{" "}
            <a
              href="tel:+919784799904"
              className="text-white font-bold text-base hover:text-blue-300 transition-colors"
            >
             97847 99904
            </a>
          </p>
        </div>
      </div>

      <main className="bg-slate-50 min-h-screen">
        <div className="fixed left-0 top-0 z-40 h-1 bg-blue-500 transition-all duration-150" style={{ width: `${readingProgress}%` }} />

        {/* Hero Banner */}
        <div className="relative text-white overflow-hidden">
          <img
            src="/blog_banner.png"
            alt="Blog Banner"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* dark overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/55 to-black/35" />

          <div className="relative max-w-5xl mx-auto px-4 py-14 sm:py-20">
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-5 transition-colors"
            >
              <ArrowLeft size={15} />
              Back to Blog
            </Link>
            <div className="mb-4">
              <span className="inline-block bg-white/15 border border-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
                {blog.category}
              </span>
            </div>
            <h1 className="max-w-4xl text-3xl sm:text-5xl font-bold leading-tight mb-5 drop-shadow-lg">
              {blog.title}
            </h1>
            <p className="max-w-3xl text-sm sm:text-base text-white/75 leading-7 mb-6">
              {blog.excerpt}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
              <span className="flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-3 py-1.5 backdrop-blur-sm">
                <User size={14} />
                {blog.author}
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-3 py-1.5 backdrop-blur-sm">
                <CalendarDays size={14} />
                {blog.date}
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-3 py-1.5 backdrop-blur-sm">
                <Clock size={14} />
                {blog.readTime}
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid lg:grid-cols-[240px_minmax(0,1fr)] gap-8 items-start">
            <aside className="hidden lg:block sticky top-24">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">On this page</p>
                <nav className="space-y-1">
                  {headings.slice(0, 8).map((heading) => (
                    <a
                      key={heading.id}
                      href={`#${heading.id}`}
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-blue-50 hover:text-blue-700"
                    >
                      {heading.title}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            <div className="min-w-0">
              {/* Article Body */}
              <article className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-8 lg:p-10 mb-8">
                <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-slate-50 p-5 mb-8">
                  <p className="text-slate-700 text-base leading-8 font-medium">
                    {blog.excerpt}
                  </p>
                </div>
                <div>{renderContent(blog.content)}</div>
              </article>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-10">
                {blog.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1.5 text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-full transition-all hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
                  >
                    <Tag size={11} />
                    {tag}
                  </span>
                ))}
              </div>

              {/* Related Articles */}
              {related.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Related Articles</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {related.map((r) => (
                      <Link
                        key={r.id}
                        to={`/blog/${r.id}`}
                        className="group bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-2"
                      >
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit">
                          {r.category}
                        </span>
                        <p className="text-slate-800 font-semibold text-sm leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
                          {r.title}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock size={11} /> {r.readTime}
                          </span>
                          <ChevronRight size={14} className="text-blue-400 transition-transform group-hover:translate-x-1" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <ScrollAdModal triggerPercent={40} />

      {/* Scroll to top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-6 right-6 z-50 p-3 rounded-full bg-blue-600 text-white shadow-lg transition-all duration-300 hover:bg-blue-700 hover:scale-110 hover:shadow-blue-400/40 hover:shadow-xl ${
          showScrollTop ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        aria-label="Scroll to top"
      >
        <ArrowUp size={18} />
      </button>
    </>
  );
};

export default BlogDetail;
