import { setDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const slidersData = [
  {
    id: 'healthy-foods',
    title: '16 healthy and safe foods you can feed your pet!',
    content: 'Here\'s a list of 16 healthy and safe foods that are generally suitable for pets like cats and dogs. Always ensure these are given in moderation and consult your vet if your pet has specific dietary needs or medical conditions.',
    items: [
      {
        title: 'Carrots',
        description: 'A great low-calorie snack, rich in beta-carotene and fiber. Serve raw or cooked, but avoid seasoning.'
      },
      {
        title: 'Apples',
        description: 'Rich in vitamins A and C. Remove the seeds and core, as they can be harmful.'
      },
      {
        title: 'Blueberries',
        description: 'Packed with antioxidants and a fun treat for training.'
      },
      {
        title: 'Bananas',
        description: 'A good source of potassium, though they should be given sparingly due to high sugar content.'
      },
      {
        title: 'Pumpkin',
        description: 'Helps with digestion and is a great source of fiber and vitamins. Use plain, unsweetened pumpkin puree.'
      },
      {
        title: 'Green Beans',
        description: 'Low-calorie and full of vitamins, green beans can be served raw or steamed without salt.'
      },
      {
        title: 'Sweet Potatoes',
        description: 'A healthy carbohydrate source, rich in vitamins and easy to digest when cooked.'
      },
      {
        title: 'Peas',
        description: 'Fresh, frozen, or steamed peas make a nutritious snack. Avoid canned peas with added sodium.'
      },
      {
        title: 'Watermelon',
        description: 'Remove seeds and rind. It\'s a hydrating treat full of vitamins A and C.'
      },
      {
        title: 'Cooked Chicken',
        description: 'A lean protein option. Avoid bones, skin, and seasoning.'
      },
      {
        title: 'Salmon',
        description: 'Cooked, boneless salmon is an excellent source of omega-3 fatty acids.'
      },
      {
        title: 'Eggs',
        description: 'Cooked eggs are a high-quality protein. Avoid raw eggs due to the risk of salmonella.'
      },
      {
        title: 'Plain Yogurt',
        description: 'Rich in calcium and probiotics, plain yogurt is a good treat if your pet is not lactose intolerant.'
      },
      {
        title: 'Cottage Cheese',
        description: 'A protein-rich snack that\'s also mild on the stomach. Use low-fat, plain versions.'
      },
      {
        title: 'Rice',
        description: 'Plain, cooked rice (white or brown) is easily digestible and ideal for pets with upset stomachs.'
      },
      {
        title: 'Oatmeal',
        description: 'A good source of fiber, especially for pets with wheat allergies. Serve plain and cooked.'
      }
    ]
  },
  {
    id: 'parasite-protection',
    title: 'Tips for keeping your pet free from parasites',
    content: 'Protecting your pets from parasites is essential for their health and happiness. Here are some practical tips to keep them safe:',
    items: [
      {
        title: 'Use Preventative Medications',
        description: 'Administer vet-recommended flea, tick, and heartworm preventatives regularly. Many treatments are available as oral tablets, topical solutions, or collars.'
      },
      {
        title: 'Keep Your Pet Clean',
        description: 'Regularly bathe and groom your pets. Use a vet-approved shampoo to help repel parasites. Check for fleas, ticks, and other pests during grooming sessions.'
      },
      {
        title: 'Maintain a Clean Environment',
        description: 'Wash your pet\'s bedding frequently. Vacuum carpets, furniture, and areas where your pet spends time to remove flea eggs and larvae. Keep outdoor areas mowed and free of tall grass, where ticks often hide.'
      },
      {
        title: 'Regular Vet Visits',
        description: 'Schedule routine check-ups to screen for parasites like worms and ticks. Request fecal tests for early detection of intestinal parasites.'
      },
      {
        title: 'Be Vigilant with Outdoor Time',
        description: 'Avoid walking your dog in areas with heavy parasite activity, such as wooded or marshy areas, especially during peak seasons. Inspect your pets for ticks and fleas after outdoor activities. Use pet-safe repellents if hiking or traveling to high-risk areas.'
      },
      {
        title: 'Practice Good Hygiene',
        description: 'Wash your hands after handling pets, especially if they\'ve been outside. Dispose of pet waste promptly to reduce the spread of parasites like roundworms and hookworms.'
      },
      {
        title: 'Provide a Balanced Diet',
        description: 'A healthy immune system can help pets resist parasites. Feed them a vet-approved, nutrient-rich diet. Avoid raw or undercooked meats, which can carry parasites.'
      },
      {
        title: 'Protect Against Mosquitoes',
        description: 'Heartworm disease is spread by mosquitoes. Use mosquito repellents safe for pets and avoid outdoor exposure during mosquito-heavy times of day.'
      },
      {
        title: 'Deworm Regularly',
        description: 'Administer deworming treatments as recommended by your veterinarian, especially for puppies, kittens, or pets that spend a lot of time outdoors.'
      },
      {
        title: 'Monitor Behavior and Symptoms',
        description: 'Watch for signs of parasite infestation, such as excessive scratching, scooting, weight loss, or a dull coat. Seek veterinary attention immediately if you suspect an infestation.'
      }
    ]
  },
  {
    id: 'vet-visits',
    title: 'How often should your pet visit the vet?',
    content: 'The frequency of veterinary visits depends on your pet\'s age, health status, and specific needs. Here\'s a general guideline for how often your pet should see the vet:',
    items: [
      {
        title: 'Puppies and Kittens',
        description: 'Every 3-4 weeks until they\'re around 4 months old. They need vaccines, deworming, and overall health monitoring as they grow. Your vet will also discuss spaying/neutering and other preventive care.'
      },
      {
        title: 'Adult Pets (1-7 years)',
        description: 'Once a year. This visit should include a physical exam, vaccinations, parasite prevention, dental health checks, and discussion of any behavioral or dietary concerns.'
      },
      {
        title: 'Senior Pets (7+ years)',
        description: 'Every 6 months. Older pets are more prone to health issues such as arthritis, kidney disease, or diabetes. Biannual exams allow for early detection and management of age-related conditions.'
      },
      {
        title: 'Pets with Chronic Conditions',
        description: 'As recommended by your vet, often every 3-6 months. Pets with conditions like diabetes, heart disease, or thyroid problems require regular monitoring and adjustments to their treatment plans.'
      }
    ]
  }
];

export const initSliders = async () => {
  try {
    for (const slider of slidersData) {
      const { imageUrl, ...sliderData } = slider;
      await setDoc(doc(db, 'sliders', slider.id), sliderData);
    }
    console.log('Sliders initialized successfully');
  } catch (error) {
    console.error('Error initializing sliders:', error);
  }
};
