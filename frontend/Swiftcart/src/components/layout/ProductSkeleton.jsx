export default function ProductSkeleton({ count = 20 }) {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (

                <article
                    key={index}
                    className="
                        group relative flex flex-col
                        w-full h-full
                        bg-white rounded-2xl
                        border border-gray-100
                        overflow-visible
                        animate-pulse
                    "
                >

                    {/* Image Skeleton */}
                    <div
                        className="relative w-full aspect-square rounded-t-2xl overflow-hidden bg-gray-100 p-4"
                    >
                        {/* Fake product image */}
                        <div className=" w-full h-full rounded-xl bg-gray-200 " />

                        {/* Fake ADD button */}
                        <div className=" absolute -bottom-3right-3 z-20 h-8  w-16 bg-gray-200 rounded-lg " />

                    </div>

                    {/* Info area */}
                    <div
                        className="flex flex-col px-3 pb-3 pt-5 flex-1 " >

                        {/* Price row */}
                        <div className="flex items-center gap-2">

                            {/* Price */}
                            <div className=" h-6 w-20  rounded bg-gray-200 " />

                            {/* MRP */}
                            <div className=" h-4 w-16 rounded bg-gray-200 " /> </div>

                        {/* Discount */}
                        <div className="  h-3 w-20 rounded bg-gray-200 mt-2"/>

                        {/* Divider */}
                        <div className=" border-t border-dashed border-gray-200 my-2 " />

                        {/* Product name */}
                        <div className="space-y-2">
                            <div className="  h-4 w-full rounded bg-gray-200"/>
                            <div className="h-4 w-4/5 rounded bg-gray-200 "/>
                             <div className=" h-4 w-3/5 rounded bg-gray-200 "/>
                        </div>

                        {/* Package */}
                        <div className="h-3 w-24 rounded bg-gray-200 mt-3 " />

                        {/* Rating */}
                        <div className="flex items-center gap-2 mt-auto pt-3 ">
                            <div className="h-5 w-7 rounded bg-gray-200 " />
                            <div className="h-3 w-8 rounded bg-gray-200" />

                            <div className="h-3 w-12 rounded bg-gray-20  " />

                        </div>

                    </div>

                </article>

            ))}
        </>
    );
}