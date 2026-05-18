const StarRating = ({ rating = 0, size = 'text-base', color = 'text-yellow-500', showValue = false }) => {
  const floorRating = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  return (
    <div className="flex items-center">
      <div className={`flex ${size} ${color}`}>
        {Array.from({ length: 5 }, (_, i) => {
          let starClass = "far fa-star";          
          if (i < floorRating)
            starClass = "fas fa-star";
          else if (i === floorRating && hasHalf)
            starClass = "fas fa-star-half-alt";        
          return <i key={i} className={starClass}></i>;
        })}
      </div>
      {showValue && ( <span className="ml-2 text-gray-600 text-sm"> {rating.toFixed(1)} </span> )}
    </div>
  );
};

export default StarRating;
