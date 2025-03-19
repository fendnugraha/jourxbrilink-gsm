import Image from "next/image";

const Loading = () => {
    return (
        <div className="fixed top-0 left-0 right-0 bottom-0">
            <div className="flex min-h-screen flex-col w-full gap-5 items-center justify-center bg-white">
                <Image src="/jour-logo.svg" alt="Logo" width={100} height={100} priority className="drop-shadow-lg animate-pulse" />
                <h1 className="text-slate-400 drop-shadow-lg">Loading, please wait ...</h1>
            </div>
        </div>
    );
};

export default Loading;
