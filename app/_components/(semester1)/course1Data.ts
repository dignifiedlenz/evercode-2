// app/_components/courseData.ts

// Define types for Questions and Video Sections
type Question = {
    id: number;
    question: string;
    options: string[];
    correctAnswer: string;
  };
  
  type VideoSection = {
    id: number;
    title: string;
    videoUrl: string;
    questions: Question[];
  };
  
  // Sample course data with 5 video sections and corresponding questions
  const course1Data: VideoSection[] = [
    {
      id: 1,
      title: '3.7.1 Introduction to the Apostles’ Creed',
      videoUrl: 'https://d3umrizzn3mmk.cloudfront.net/3.7.1+I+believe+in+God.mp4', // Replace with your S3 link
      questions: [
        {
          id: 1,
          question: 'What is the first line of the Apostles’ Creed?',
          options: [
            'I believe in God, the Father Almighty',
            'I believe in Jesus Christ',
            'I believe in the Holy Spirit',
            'I believe in the Church',
          ],
          correctAnswer: 'I believe in God, the Father Almighty',
        },
        {
          id: 2,
          question: 'Who is the creator according to the Creed?',
          options: [
            'Jesus Christ',
            'The Holy Spirit',
            'God the Father Almighty',
            'The Apostles',
          ],
          correctAnswer: 'God the Father Almighty',
        },
        {
          id: 3,
          question: 'What does the Creed affirm about Jesus Christ?',
          options: [
            'His mortality',
            'His divinity',
            'His writings',
            'His teachings',
          ],
          correctAnswer: 'His divinity',
        },
        {
          id: 4,
          question: 'According to the Creed, what did Jesus do?',
          options: [
            'Built the church',
            'Suffered under Pontius Pilate',
            'Wrote the Bible',
            'Traveled the world',
          ],
          correctAnswer: 'Suffered under Pontius Pilate',
        },
        {
          id: 5,
          question: 'What does the Creed say about the Holy Spirit?',
          options: [
            'He is a prophet',
            'He is a teacher',
            'He is the giver of life',
            'He is a servant',
          ],
          correctAnswer: 'He is the giver of life',
        },
      ],
    },
    {
      id: 2,
      title: 'The Nature of God',
      videoUrl: 'https://d3umrizzn3mmk.cloudfront.net/3.7.2+The+Father+Almighty%2C+Creator+of+heaven+and+earth.mp4', // Replace with your S3 link
      questions: [
        {
          id: 1,
          question: 'How does the Creed describe God?',
          options: [
            'Omniscient and omnipotent',
            'Limited in power',
            'Only a distant creator',
            'As a mythical figure',
          ],
          correctAnswer: 'Omniscient and omnipotent',
        },
        {
          id: 2,
          question: 'What does "Almighty" signify about God?',
          options: [
            'His age',
            'His power',
            'His location',
            'His knowledge',
          ],
          correctAnswer: 'His power',
        },
        {
          id: 3,
          question: 'According to the Creed, God is the creator of:',
          options: [
            'Only the heavens',
            'Only the earth',
            'All things',
            'None of the above',
          ],
          correctAnswer: 'All things',
        },
        {
          id: 4,
          question: 'The Creed affirms God as:',
          options: [
            'A single entity',
            'A triune being',
            'Multiple gods',
            'An abstract concept',
          ],
          correctAnswer: 'A triune being',
        },
        {
          id: 5,
          question: 'Which attribute is NOT associated with God in the Creed?',
          options: [
            'Eternal',
            'Invisible',
            'Immovable',
            'Human-like',
          ],
          correctAnswer: 'Human-like',
        },
      ],
    },
    {
      id: 3,
      title: 'Jesus Christ in the Creed',
      videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw', // Replace with your S3 link
      questions: [
        {
          id: 1,
          question: 'What does the Creed state about Jesus’ birth?',
          options: [
            'Born in Nazareth',
            'Born of the Virgin Mary',
            'Born in a manger',
            'Born under a star',
          ],
          correctAnswer: 'Born of the Virgin Mary',
        },
        {
          id: 2,
          question: 'According to the Creed, Jesus suffered under:',
          options: [
            'King Herod',
            'Pontius Pilate',
            'Roman soldiers',
            'Both b and c',
          ],
          correctAnswer: 'Pontius Pilate',
        },
        {
          id: 3,
          question: 'What does the Creed say Jesus did on the third day?',
          options: [
            'Ascended to heaven',
            'Was resurrected',
            'Performed miracles',
            'Baptized disciples',
          ],
          correctAnswer: 'Was resurrected',
        },
        {
          id: 4,
          question: 'Where did Jesus ascend according to the Creed?',
          options: [
            'To the temple',
            'To the mountaintop',
            'Into heaven',
            'To Jerusalem',
          ],
          correctAnswer: 'Into heaven',
        },
        {
          id: 5,
          question: 'The Creed professes Jesus will come to judge:',
          options: [
            'The living',
            'The dead',
            'Both the living and the dead',
            'None of the above',
          ],
          correctAnswer: 'Both the living and the dead',
        },
      ],
    },
    {
      id: 4,
      title: 'The Holy Spirit and the Church',
      videoUrl: 'https://www.youtube.com/watch?v=3JZ_D3ELwOQ', // Replace with your S3 link
      questions: [
        {
          id: 1,
          question: 'What role does the Holy Spirit play according to the Creed?',
          options: [
            'Creator',
            'Savior',
            'Giver of life',
            'Judge',
          ],
          correctAnswer: 'Giver of life',
        },
        {
          id: 2,
          question: 'The Creed affirms belief in the holy Church as:',
          options: [
            'A building',
            'The community of believers',
            'An organization',
            'A tradition',
          ],
          correctAnswer: 'The community of believers',
        },
        {
          id: 3,
          question: 'According to the Creed, the Church is:',
          options: [
            'Human-made',
            'Invisible',
            'Holy and universal',
            'Limited to certain regions',
          ],
          correctAnswer: 'Holy and universal',
        },
        {
          id: 4,
          question: 'What does the Creed say about the communion of saints?',
          options: [
            'It is symbolic',
            'It includes all believers',
            'It is optional',
            'It is historical',
          ],
          correctAnswer: 'It includes all believers',
        },
        {
          id: 5,
          question: 'The Creed mentions the forgiveness of sins:',
          options: [
            'Only through good deeds',
            'Through Jesus Christ',
            'By personal effort',
            'Not at all',
          ],
          correctAnswer: 'Through Jesus Christ',
        },
      ],
    },
    {
      id: 5,
      title: 'Eternal Life and Resurrection',
      videoUrl: 'https://www.youtube.com/watch?v=l482T0yNkeo', // Replace with your S3 link
      questions: [
        {
          id: 1,
          question: 'What does the Creed affirm about eternal life?',
          options: [
            'It is a metaphor',
            'Believers will receive it',
            'It is uncertain',
            'It is earned by works',
          ],
          correctAnswer: 'Believers will receive it',
        },
        {
          id: 2,
          question: 'According to the Creed, Jesus will come to:',
          options: [
            'Proclaim peace',
            'Rule the world',
            'Judge the living and the dead',
            'Perform miracles',
          ],
          correctAnswer: 'Judge the living and the dead',
        },
        {
          id: 3,
          question: 'The Creed speaks of Jesus’ return as:',
          options: [
            'A past event',
            'A future hope',
            'A symbolic idea',
            'An unknown mystery',
          ],
          correctAnswer: 'A future hope',
        },
        {
          id: 4,
          question: 'Resurrection in the Creed refers to:',
          options: [
            'Only Jesus',
            'All people',
            'Only the righteous',
            'Only the saints',
          ],
          correctAnswer: 'All people',
        },
        {
          id: 5,
          question: 'Eternal life according to the Creed is in:',
          options: [
            'Heaven only',
            'Earth only',
            'Heaven and earth',
            'A spiritual realm',
          ],
          correctAnswer: 'Heaven and earth',
        },
      ],
    },
    {
        id: 6,
        title: 'Eternal Life and Resurrection',
        videoUrl: 'https://www.youtube.com/watch?v=l482T0yNkeo', // Replace with your S3 link
        questions: [
          {
            id: 1,
            question: 'What does the Creed affirm about eternal life?',
            options: [
              'It is a metaphor',
              'Believers will receive it',
              'It is uncertain',
              'It is earned by works',
            ],
            correctAnswer: 'Believers will receive it',
          },
          {
            id: 2,
            question: 'According to the Creed, Jesus will come to:',
            options: [
              'Proclaim peace',
              'Rule the world',
              'Judge the living and the dead',
              'Perform miracles',
            ],
            correctAnswer: 'Judge the living and the dead',
          },
          {
            id: 3,
            question: 'The Creed speaks of Jesus’ return as:',
            options: [
              'A past event',
              'A future hope',
              'A symbolic idea',
              'An unknown mystery',
            ],
            correctAnswer: 'A future hope',
          },
          {
            id: 4,
            question: 'Resurrection in the Creed refers to:',
            options: [
              'Only Jesus',
              'All people',
              'Only the righteous',
              'Only the saints',
            ],
            correctAnswer: 'All people',
          },
          {
            id: 5,
            question: 'Eternal life according to the Creed is in:',
            options: [
              'Heaven only',
              'Earth only',
              'Heaven and earth',
              'A spiritual realm',
            ],
            correctAnswer: 'Heaven and earth',
          },
        ],
      },
  ];
  
  export default course1Data;
  