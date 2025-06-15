interface ImageUrls {
  thumbnail: string;
  small: string;
  regular: string;
  large: string;
}

export const HeroImage = ({ urls, aspectRatio }: { urls: ImageUrls; aspectRatio?: string }) => {
  let ratio = aspectRatio || "60%";
  const style = { width: "100%", position: "relative", paddingTop: ratio };
  const styleInner = { position: "absolute", top: 0, left: 0, bottom: 0, right: 0 };
  return (
    <div className="image-container-outer" style={style}>
      <div className="image-container" style={styleInner}>
        <img
          src={urls.thumbnail}
          alt="Image"
          className={`object-cover blur-sm opacity-70`}
          style={{ width: "100%", height: "100%", backgroundPosition: "center center" }}
        />
      </div>
    </div>
  );
};
