export const media = {
  merch: {
    tshirtGreen: "/Assets/Merchandise/T-shirt.jpeg",
    tshirtYellow: "/Assets/Merchandise/T-shirt2.jpg",
    tshirtBlack: "/Assets/Merchandise/T-shirt3.jpeg",
    golfBlack: "/Assets/Merchandise/Golf-shirt1.jpeg",
    golfGreen: "/Assets/Merchandise/Golf-shirt2.jpeg",
    golfWhite: "/Assets/Merchandise/Golf-shirt3.jpg",
    capBeige: "/Assets/Merchandise/cap1.jpg",
    capBlue: "/Assets/Merchandise/Cap2.webp",
    capRed: "/Assets/Merchandise/Cap3.jpeg",
    mugLion: "/Assets/Merchandise/Mug1.webp",
    mugLeoThing: "/Assets/Merchandise/Mug2.jpeg",
    mugStacked: "/Assets/Merchandise/Mug3.webp",
  },
  posters: {
    valentines: "/Assets/Activities/valentines.jpeg",
    bbq: "/Assets/Activities/PIC1.jpg",
    womensDay: "/Assets/Activities/pic2.jpg",
    specialNeeds: "/Assets/Activities/pic3.jpg",
    bloodDrive: "/Assets/Activities/pic4.jpg",
    meeting: "/Assets/Activities/meeting.jpeg",
  },
  activities: {
    social: "/Assets/Activities/social-activity.jpeg",
    planting: [
      "/Assets/Activities/planting-1.jpeg",
      "/Assets/Activities/planting-2.jpeg",
      "/Assets/Activities/planting-3.jpeg",
      "/Assets/Activities/planting-4.jpeg",
      "/Assets/Activities/planting-5.jpeg",
      "/Assets/Activities/planting-6.jpeg",
      "/Assets/Activities/planting-7.jpeg",
      "/Assets/Activities/planting-8.jpeg",
      "/Assets/Activities/planting-9.jpeg",
      "/Assets/Activities/planting-10.jpeg",
      "/Assets/Activities/planting-11.jpeg",
      "/Assets/Activities/planting-12.jpeg",
    ],
    bins: [
      "/Assets/Activities/bin-placement.jpeg",
      "/Assets/Activities/bin-placement-2.jpeg",
      "/Assets/Activities/bin-placement-3.jpeg",
    ],
  },
  photos: {
    environment: "/Assets/environment.jpg",
    communityService: "/Assets/community-service.jpg",
    bloodDonation: "/Assets/blood-donation.jpg",
    charityGala: "/charity-gala.png",
    cleanup: "/community-cleanup-volunteers.png",
    education: "/education-outreach-children.jpg",
    treeCleanup: "/tree-planting-cleanup.jpg",
    treeVolunteers: "/tree-planting-volunteers.png",
    youthGroup: "/youth-workshop-group.jpg",
    youthLeadership: "/youth-workshop-leadership.jpg",
    homeHero: "/Assets/hero.jpg",
    impact:"/Assets/impact.jpg",
    logo: "/logo.jpeg",
    executive: "/Assets/executive.jpeg",
  },

  videos: {
    impactVideo: "/Assets/impact-video.mp4",
  },
  people: {
    male: "/professional-male-headshot.png",
    female: "/professional-headshot-female.png",
    male2: "/professional-headshot-male-2.png",
    female2: "/professional-headshot-female-2.png",
  },
} as const

export type PromoSlide = {
  id: string
  title: string
  image: string
  href: string
}

export const promoSlides: PromoSlide[] = [
  {
    id: "valentines",
    title: "Valentines Special",
    image: media.posters.valentines,
    href: "/portal/shop/category/mug",
  },
  {
    id: "bbq",
    title: "Changeover BBQ Party",
    image: media.posters.bbq,
    href: "/portal/events",
  },
  {
    id: "blood",
    title: "Blood Donation Drive",
    image: media.posters.bloodDrive,
    href: "/portal/events",
  },
  {
    id: "womens-day",
    title: "International Women's Day",
    image: media.posters.womensDay,
    href: "/portal/events",
  },
  {
    id: "special-needs",
    title: "Community Support Visit",
    image: media.posters.specialNeeds,
    href: "/portal/events",
  },
]
