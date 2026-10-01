export function StoryCardRating({ rating }: { rating: number }) {
  const filledStars = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <span className="story-card-rating" aria-label={`Puntuación: ${rating} de 5`}>
      <span className="story-card-rating-stars" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <svg className={index < filledStars ? "story-card-rating-star is-filled" : "story-card-rating-star"} viewBox="0 0 24 24" key={index}>
            <path d="m12 2.5 3.04 6.17 6.81.99-4.93 4.8 1.16 6.78L12 18.04l-6.08 3.2 1.16-6.78-4.93-4.8 6.81-.99L12 2.5Z" />
          </svg>
        ))}
      </span>
      <span className="story-card-rating-score" aria-hidden="true">{rating}<span>/5</span></span>
    </span>
  );
}
