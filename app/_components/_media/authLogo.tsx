import Image from "next/image";

export const AuthLogo = () => {
    return (
        <Image
            height={140}
            width={140}
            alt="authlogo"
            src="/logo.svg"
        />
    )
}