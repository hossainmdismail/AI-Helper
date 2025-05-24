export function LoadingDots() {
  return (
    <span className="loading-dots">
      <style jsx>{`
        .loading-dots::after {
          content: '...';
          animation: dots 1.5s steps(3, end) infinite;
          display: inline-block;
          width: 1em;
          text-align: left;
        }
        @keyframes dots {
          0%, 20% {
            color: rgba(0,0,0,0);
            text-shadow:
              .25em 0 0 rgba(0,0,0,0),
              .5em 0 0 rgba(0,0,0,0);
          }
          40% {
            color: black;
            text-shadow:
              .25em 0 0 rgba(0,0,0,0),
              .5em 0 0 rgba(0,0,0,0);
          }
          60% {
            text-shadow:
              .25em 0 0 black,
              .5em 0 0 rgba(0,0,0,0);
          }
          80%, 100% {
            text-shadow:
              .25em 0 0 black,
              .5em 0 0 black;
          }
        }
      `}</style>
    </span>
  );
}
