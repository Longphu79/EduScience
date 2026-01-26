import { Star } from "lucide-react";

export function RatingStars({ rating }) {
    return(
        <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(i => (
                <Star
                    key={i}
                    size={14}
                    className={
                        i <= rating
                            ?'fill-red-500 text-red-500'
                            :'text-gray-300'
                    }
                />
            ))}
            <span className="ml-2 text-neutral-600 text-sm">{rating}</span>
        </div>
    );
}