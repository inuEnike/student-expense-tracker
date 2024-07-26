function test() {
  const ProfileImage = ["/image1.png", "/image2.png", "/image3.png"];
  const shuffledImage = Math.floor(Math.random() * ProfileImage.length);
  const selectedImage = ProfileImage[shuffledImage];

  console.log(selectedImage);
}
test();
