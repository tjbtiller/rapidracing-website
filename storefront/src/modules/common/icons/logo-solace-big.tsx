import Image from 'next/image'

export const SolaceLogoBig = () => {
  return (
    <Image
      src="./RapidRacing.png" // Path to the PNG file in the same folder
      alt="Rapid Racing Logo"
      width={4096} // Adjust width as needed
      height={1212} // Adjust height as needed
    />
  )
}
