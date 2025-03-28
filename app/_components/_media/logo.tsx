import Image from "next/image";

export const Logo = () => {
    return (
        <div className="relative w-8 h-8 sm:w-[60px] sm:h-[60px]">
            <Image
                fill
                alt="logo"
                src="/logo.svg"
                className="object-contain"
                sizes="(max-width: 640px) 32px, 60px"
                priority
            />
        </div>
    )
}