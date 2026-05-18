import React, { useEffect } from "react";

const SkeletonStat = ({stat}) => (
  <div className="stat-card skeleton-shimmer animate-fade-in">
    <div className="h-8 w-24 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded mx-auto mb-2" />
    <div className="text-gray-600">{stat}</div>
  </div>
);

const StatsSection = ({ data, loading }) => {
  useEffect(() => {
    if (!data || loading) return;
    const targets = [
      data.booksAvailable,
      data.activeReaders,
      data.publishers,
      data.booksSold,
    ];
    const counters = document.querySelectorAll(".counter");
    counters.forEach((el, index) => {
      const target = targets[index];
      let start = 0;
      const duration = 1500;
      const frameRate = 1000 / 60;
      const totalFrames = Math.round(duration / frameRate);
      const increment = target / totalFrames;
      let frame = 0;
      const interval = setInterval(() => {
        frame++;
        start += increment;
        if (frame >= totalFrames) {
          clearInterval(interval);
          el.textContent = Math.floor(target).toLocaleString();
        } else {
          el.textContent = Math.floor(start).toLocaleString();
        }
      }, frameRate);
    });
  }, [data, loading]);

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-4 gap-8 text-center">
          {loading ? (
            <>
              <SkeletonStat stat="Books Available" />
              <SkeletonStat stat="Active Readers" />
              <SkeletonStat stat="Publishers" />
              <SkeletonStat stat="Books Sold" />
            </>
          ) : (
            <>
              <div className="stat-card">
                <div
                  className="text-3xl font-bold text-purple-600 counter"
                  data-target={data.booksAvailable}
                >
                  0
                </div>
                <div className="text-gray-600">Books Available</div>
              </div>
              <div className="stat-card">
                <div
                  className="text-3xl font-bold text-purple-600 counter"
                  data-target={data.activeReaders}
                >
                  0
                </div>
                <div className="text-gray-600">Active Readers</div>
              </div>
              <div className="stat-card">
                <div
                  className="text-3xl font-bold text-purple-600 counter"
                  data-target={data.publishers}
                >
                  0
                </div>
                <div className="text-gray-600">Publishers</div>
              </div>
              <div className="stat-card">
                <div
                  className="text-3xl font-bold text-purple-600 counter"
                  data-target={data.booksSold}
                >
                  0
                </div>
                <div className="text-gray-600">Books Sold</div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
