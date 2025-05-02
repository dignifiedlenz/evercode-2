// src/app/_components/(semester1)/CourseData.tsx

import { Semester } from "@/types/course";

export const courseData: Semester[] = [
  {
    id: "semester-1",
    title: "Semester 1: Back to Basics",
    description: "Building the fundamentals of web development",
    backgroundImage: "/sm/306383rg.jpeg",
    instructors: [
      {
        id: "instructor-1-1",
        name: "Fr. Ambrose Criste",
        description: "Fr. Ambrose Criste is a priest of the Diocese of Brooklyn and New York. He is a member of the Dominican Order and a member of the Dominican Friars of the Immaculate Conception.",
        profileImage: "/ambrose.png",
        role: "Lead Instructor",
        introductionVideo: "https://evermodecontent.s3.us-east-1.amazonaws.com/Fr.+Ambrose+Introduction.mp4"
      },
      {
        id: "instructor-1-2",
        name: "Fr. Hugh Barbour",
        description: "Fr. Hugh Barbour is a priest of the Diocese of Brooklyn and New York. He is a member of the Dominican Order and a member of the Dominican Friars of the Immaculate Conception.",
        profileImage: "/hugh.png",
        role: "UX Specialist",
        introductionVideo: "https://evermodecontent.s3.us-east-1.amazonaws.com/Father+Hugh+Introduction.mp4"
      }
    ],
    chapters: [
      {
        id: "chapter-1",
        title: "Why are we Here?",
        description: "Explore the fundamental beliefs about Jesus Christ and the doctrine of Incarnation",
        backgroundImage: "/sm/500063ldsdl.jpeg",
        instructor: {
          id: "instructor-1-1",
          name: "Fr. Ambrose Criste",
          description: "Fr. Ambrose Criste is a priest of the Diocese of Brooklyn and New York. He is a member of the Dominican Order and a member of the Dominican Friars of the Immaculate Conception.",
          profileImage: "/ambrose.png",
          role: "Lead Instructor",
          introductionVideo: "https://evermodecontent.s3.us-east-1.amazonaws.com/Fr.+Ambrose+Introduction.mp4"
        },
        units: [
          {
            id: "unit-1",
            title: "Unit 1.1: Why are we Here? (Part 1)",
            video: {
              id: "video-1",
              title: "Why are we Here? (Part 1)",
              videoUrl: "https://d3umrizzn3mmk.cloudfront.net/1.3.1+Small.mp4",
              questions: [
                {
                  id: "q1",
                  question: "What is the ultimate answer to the question \"Why are we here on earth?\"",
                  options: [
                    "To be a good global citizen",
                    "To be the best version of ourselves",
                    "To get to heaven",
                    "To enjoy life to its fullest",
                  ],
                  correctAnswer: "To get to heaven",
                },
                {
                  id: "q2",
                  question: "The Latin phrase 'respice ad finem' means",
                  options: ["Fear the end", "Look to the end", "Find respite", "The final recipe"],
                  correctAnswer: "Look to the end",
                },
                {
                  id: "q3",
                  question: "According to Plato, the ultimate purpose of human existence is _______.",
                  options: [
                    "Happiness",
                    "Fulfillment",
                    "Goodness",
                    "To get to heaven",
                  ],
                  correctAnswer: "Goodness",
                },
                {
                  id: "q4",
                  question: "Philosophy comes from the Greek word 'philosophia' which means _____.",
                  options: [
                    "Fear of the world",
                    "Brotherly love",
                    "Love of wisdom",
                    "The art of knowing truth",
                  ],
                  correctAnswer: "Love of wisdom",
                },
                {
                  id: "q5",
                  question: "According to Aristotle, the ultimate purpose of human existence must be some concrete goodness which man is striving for. That good thing is _____.",
                  options: [
                    "Happiness",
                    "Joyfulness",
                    "Truthfulness",
                    "Faithfulness",
                  ],
                  correctAnswer: "Happiness",
                },
              ],
            },
          },
          {
            id: "unit-2",
            title: "Why Are We Here? (Part Two)",
            video: {
              id: "video-2",
              title: "Why Are We Here? (Part Two)",
              videoUrl: "https://d3umrizzn3mmk.cloudfront.net/1.3.2+Small.mp4",
              questions: [
                {
                  id: "q6",
                  question: "Sanctifying Grace allows us to share in God's own life and ____.",
                  options: [
                    "Power",
                    "Creation",
                    "Love",
                    "Divine Justice",
                  ],
                  correctAnswer: "Love",
                },
                {
                  id: "q7",
                  question: "Grace is the Latin word for _____.",
                  options: [
                    "Prayer",
                    "Mercy",
                    "Wholeness",
                    "Gift",
                  ],
                  correctAnswer: "Gift",
                },
                {
                  id: "q8",
                  question: "When sanctifying grace dwells in our soul, we can _____.",
                  options: [
                    "Receive holy communion",
                    "Grow in virtue",
                    "Store up treasure in heaven",
                    "All of the Above",
                  ],
                  correctAnswer: "All of the Above",
                },
                {
                  id: "q9",
                  question: "Unlike other animals, humans have a rational soul which allows them to do what?",
                  options: [
                    "To eat and sleep",
                    "To think and choose freely",
                    "To reproduce",
                    "To be programmed against their will",
                  ],
                  correctAnswer: "To think and choose freely",
                },
                {
                  id: "q10",
                  question: "The soul is what makes the human body alive.",
                  options: [
                    "True",
                    "False",
                  ],
                  correctAnswer: "True",
                },
              ],
            },
          },
          {
            id: "unit-3",
            title: "Why Are We Here? (Part Three)",
            video: {
              id: "video-3",
              title: "Why Are We Here? (Part Three)",
              videoUrl: "https://d3umrizzn3mmk.cloudfront.net/1.3.3+Small.mp4",
              questions: [
                {
                  id: "q11",
                  question: "Who said the following quote: \"In the evening of life, we will be judged on love alone.\"?",
                  options: [
                    "St. John the Evangelist",
                    "St. John of the Cross",
                    "St. Teresa of Avila",
                    "St. Therese of the Child Jesus",
                  ],
                  correctAnswer: "St. John of the Cross",
                },
                {
                  id: "q12",
                  question: "Purgatory is a place for _____.",
                  options: [
                    "Eternal reward",
                    "Purification for the temporal punishment of sin",
                    "Eternal damnation",
                    "None of the above",
                  ],
                  correctAnswer: "Purification for the temporal punishment of sin",
                },
                {
                  id: "q13",
                  question: "The problem with universalism is _____.",
                  options: [
                    "That it is unclear where the church stands on this theological question",
                    "That it states that not everyone will be saved",
                    "That it rejects all that God has done for us in order to save us",
                    "All of the above",
                  ],
                  correctAnswer: "That it rejects all that God has done for us in order to save us",
                },
                {
                  id: "q14",
                  question: "Death marks the end of our opportunity to receive the life of sanctifying grace in our soul.",
                  options: [
                    "True",
                    "False",
                  ],
                  correctAnswer: "True",
                },
                {
                  id: "q15",
                  question: "It is possible to be saved apart from the way made possible by Christ.",
                  options: [
                    "True",
                    "False",
                  ],
                  correctAnswer: "False",
                },
              ],
            },
          },
        ],
      },
      {
        id: "chapter-2",
        title: "Reality 101 - Basic Philosophy",
        description: "Learn about the nature of reality and how we can know it.",
        backgroundImage: "/sm/500063ldsdl.jpeg",
        instructor: {
          id: "instructor-1-2",
          name: "Fr. Hugh Barbour",
          description: "Fr. Hugh Barbour is a priest of the Diocese of Brooklyn and New York. He is a member of the Dominican Order and a member of the Dominican Friars of the Immaculate Conception.",
          profileImage: "/hugh.png",
          role: "UX Specialist",
          introductionVideo: "https://evermodecontent.s3.us-east-1.amazonaws.com/Father+Hugh+Introduction.mp4"
        },
        units: [
          {
            id: "unit-4",
            title: "Basic Philosophy (Part One)",
            video: {
              id: "video-4",
              title: "Basic Philosophy (Part One)",
              videoUrl: "https://d3umrizzn3mmk.cloudfront.net/1.4.1+Small.mp4",
              questions: [
                {
                  id: "q21",
                  question: "What is the universal definition of Truth?",
                  options: [
                    "Truth is the conformance of reality to the human senses.",
                    "Truth is the mind's conformance to reality.",
                    "Truth is reality conforming to the mind.",
                    "Truth is the sensory perception of the physical world by an individual.",
                  ],
                  correctAnswer: "Truth is the mind's conformance to reality.",
                },
                {
                  id: "q22",
                  question: "Fr. Sebastian mentions Zeno's Paradox in order to establish which preliminary premise?",
                  options: [
                    "There is no such thing as a self-evident truth.",
                    "People who study philosophy like to impress others with their wisdom.",
                    "We can know that a statement is true even if we cannot answer every objection.",
                    "None of the above.",
                  ],
                  correctAnswer: "We can know that a statement is true even if we cannot answer every objection.",
                },
                {
                  id: "q23",
                  question: "Which of the following statements represents the main claim which the three erroneous doctrines propose?",
                  options: [
                    "The human mind is incapable of coming to know things and of being in contact with reality.",
                    "Although it is possible, it is difficult for the human mind to come to know things with certainty.",
                    "Truth exists and humans can know it.",
                    "None of the above",
                  ],
                  correctAnswer: "The human mind is incapable of coming to know things and of being in contact with reality.",
                },
                {
                  id: "q24",
                  question: "\"I'm personally against abortion, however, should a woman in a crisis pregnancy decide to have one, who am I to say that what she is doing is wrong? If she believes this is the right thing for her to do, then she should do it.\" This is an example of which erroneous doctrine?",
                  options: [
                    "Moral indifferentism",
                    "Intellectual relativism",
                    "Subjectivism",
                    "Moral Relativism",
                  ],
                  correctAnswer: "Moral Relativism",
                },
                {
                  id: "q25",
                  question: "What is a sophism?",
                  options: [
                    "A sophisticated argument which is nevertheless easy to understand",
                    "An argument which seems to be false, but is in fact true",
                    "An argument which seems to be true, but is in fact false",
                    "An irrefutable argument",
                  ],
                  correctAnswer: "An argument which seems to be true, but is in fact false",
                },
              ],
            },
          },
          {
            id: "unit-5",
            title: "Basic Philosophy (Part Two)",
            video: {
              id: "video-5",
              title: "Basic Philosophy (Part Two)",
              videoUrl: "https://d3umrizzn3mmk.cloudfront.net/1.4.2+Small.mp4",
              questions: [
                {
                  id: "q26",
                  question: "Equivocation is using the same word to signify two different ideas. A relativist will often make an equivocation in their speech between which two ideas?",
                  options: [
                    "Opinion and reality",
                    "Truth and reality",
                    "Truth and opinion",
                    "Good and truth",
                  ],
                  correctAnswer: "Truth and opinion",
                },
                {
                  id: "q27",
                  question: "Moral relativism is always a doctrine of _______.",
                  options: [
                    "Equality",
                    "Solidarity",
                    "The common good",
                    "The stronger oppressing the weaker",
                  ],
                  correctAnswer: "The stronger oppressing the weaker",
                },
                {
                  id: "q28",
                  question: "In order to know the conclusion of any argument, one must first know the truth of its _____.",
                  options: [
                    "Statements",
                    "Premises",
                    "Counter Arguments",
                    "Logic",
                  ],
                  correctAnswer: "Premises",
                },
                {
                  id: "q29",
                  question: "Truths which are not the conclusion of any prior argument are called _____.",
                  options: [
                    "Self-evident",
                    "A priori",
                    "Experiential",
                    "Demonstrative",
                  ],
                  correctAnswer: "Self-evident",
                },
                {
                  id: "q30",
                  question: "Moral relativists quickly turn into moral objectivists as soon as they _____.",
                  options: [
                    "Recognize that there is no such thing as a truth",
                    "Suffer some type of injustice at the hands of others",
                    "Begin to oppress the vulnerable",
                    "Unintentionally cause harm to others",
                  ],
                  correctAnswer: "Suffer some type of injustice at the hands of others",
                },
              ],
            },
          },
          {
            id: "unit-6",
            title: "Basic Philosophy (Part Three)",
            video: {
              id: "video-6",
              title: "Basic Philosophy (Part Three)",
              videoUrl: "https://d3umrizzn3mmk.cloudfront.net/1.4.3+Small.mp4",
              questions: [
                {
                  id: "q31",
                  question: "Intellectual customs are habits of thought or inclinations of the mind, based not upon _____, but based upon what seems ____ for us to believe as true or not.",
                  options: [
                    "Human reason; wrong",
                    "Truth; wrong",
                    "Evidence; good",
                    "Feelings; good",
                  ],
                  correctAnswer: "Evidence; good",
                },
                {
                  id: "q32",
                  question: "What is an example of a statement that we believe to be self-evident based on intellectual custom but earlier in history was not understood as self-evident?",
                  options: [
                    "Poverty is an evil which must be avoided",
                    "Slavery is an evil practice",
                    "Stealing is an immoral act",
                    "Murder merits the death penalty",
                  ],
                  correctAnswer: "Slavery is an evil practice",
                },
                {
                  id: "q33",
                  question: "What is the definition of logic?",
                  options: [
                    "Logic is the art of thinking subjectively",
                    "Logic is the art of reasoning well",
                    "Logic is an activity whereby we come to know reality based on our experiences and emotions",
                    "Logic is the art of complex reasoning",
                  ],
                  correctAnswer: "Logic is the art of reasoning well",
                },
                {
                  id: "q34",
                  question: "What is one way that we can free ourselves of bad intellectual custom?",
                  options: [
                    "By listening to current political commentators",
                    "By watching the latest series trending on Netflix",
                    "By figuratively traveling in place and time in order to compare what our culture believes with another",
                    "None of the above",
                  ],
                  correctAnswer: "By figuratively traveling in place and time in order to compare what our culture believes with another",
                },
                {
                  id: "q35",
                  question: "Why is it important for people to be aware of intellectual customs?",
                  options: [
                    "In order to keep us up-to-date with the most current philosophical thought",
                    "So that familiarity with the statements we hear all around us does not jeopardize our acquisition of truth",
                    "Because truth is based on what the majority of people in society agree upon.",
                    "Because intellectual customs are always objectively true.",
                  ],
                  correctAnswer: "So that familiarity with the statements we hear all around us does not jeopardize our acquisition of truth",
                },
              ],
            },
          },
          {
            id: "unit-7",
            title: "Basic Philosophy (Part Four)",
            video: {
              id: "video-7",
              title: "Basic Philosophy (Part Four)",
              videoUrl: "https://d3umrizzn3mmk.cloudfront.net/1.4.4+SmallN.mp4",
              questions: [
                {
                  id: "q36",
                  question: "What is an example that demonstrates how subjectivism is part of our intellectual custom?",
                  options: [
                    "Movies that showcase the challenge of knowing the difference between the dream state and reality.",
                    "\"There's my truth and your truth\" is a commonly heard expression",
                    "A person's feelings are the more important than the truth",
                    "All of the above",
                  ],
                  correctAnswer: "All of the above",
                },
                {
                  id: "q37",
                  question: "Sometimes when we are dreaming, we think we are awake; therefore, we cannot be completely certain that what we experience as wakefulness is only another dream state. This is an argument against subjectivism.",
                  options: [
                    "False",
                    "True",
                  ],
                  correctAnswer: "False",
                },
                {
                  id: "q38",
                  question: "Although arguments in favor of subjectivism claim that things cannot be known in themselves, they always consist of an implicit premise disproving their argument.",
                  options: [
                    "True",
                    "False",
                  ],
                  correctAnswer: "True",
                },
                {
                  id: "q39",
                  question: "What is the easiest way to overcome the intellectual culture in favor of subjectivism?",
                  options: [
                    "By arguing",
                    "By the application of logic",
                    "By ignoring it",
                    "None of the above",
                  ],
                  correctAnswer: "By the application of logic",
                },
                {
                  id: "q40",
                  question: "What is a sure way to overcome a false intellectual custom or false views about reality?",
                  options: [
                    "Knowing what you mean when you speak",
                    "Knowing a good argument from a bad one",
                    "Clarity of thought",
                    "All of the above",
                  ],
                  correctAnswer: "All of the above",
                },
              ],
            },
          },
        ],
      },
      {
        id: "chapter-3",
        title: "Who is God?",
        description: "Learn about the nature of God and His relationship to the world.",
        backgroundImage: "/310282rg.jpg",
        units: [
          {
            id: "unit-8",
            title: "Who is God? (Part One)",
            video: {
              id: "video-8",
              title: "Who is God? (Part One)",
              videoUrl: "https://d3umrizzn3mmk.cloudfront.net/1.5.1+Small.mp4",
              questions: [
                {
                  id: "q41",
                  question: "The word revelation comes from the Latin word revelatio, which means?",
                  options: [
                    "Illumination",
                    "Rebellion",
                    "Unveiling",
                    "Apparition",
                  ],
                  correctAnswer: "Unveiling",
                },
                {
                  id: "q42",
                  question: "According to St. Thomas Aquinas, if not for God revealing truths about himself through Divine Revelation, these truths would be known by ______.",
                  options: [
                    "Only a few people",
                    "Only Over a long period of time",
                    "With a great mixture of error",
                    "All of the above",
                  ],
                  correctAnswer: "All of the above",
                },
                {
                  id: "q43",
                  question: "When was the first Divine Revelation first given to mankind by God?",
                  options: [
                    "Directly after the Fall with the promise of a Savior",
                    "At the creation of the Earth",
                    "With the creation of Eve",
                    "When the rainbow appeared after the great flood",
                  ],
                  correctAnswer: "Directly after the Fall with the promise of a Savior",
                },
                {
                  id: "q44",
                  question: "Divine revelation is God's showing of himself in creation by conveying truths which we could not have known based on our own natural power.",
                  options: [
                    "True",
                    "False",
                  ],
                  correctAnswer: "True",
                },
                {
                  id: "q45",
                  question: "Catholics believe that the Word made flesh is the primary and most authoritative source of Divine Revelation and from this flow both Sacred Tradition and Sacred Scripture.",
                  options: [
                    "True",
                    "False",
                  ],
                  correctAnswer: "True",
                },
              ],
            },
          },
          {
            id: "unit-9",
            title: "Who is God? (Part Two)",
            video: {
              id: "video-9",
              title: "Who is God? (Part Two)",
              videoUrl: "https://d3umrizzn3mmk.cloudfront.net/1.5.2+Small.mp4",
              questions: [
                {
                  id: "q46",
                  question: "God is an _____ pure spirit and maker of ______.",
                  options: [
                    "Uncreated; all things",
                    "Universal; all spiritual things",
                    "Unknown; all things",
                    "Unattainable; all physical things",
                  ],
                  correctAnswer: "Uncreated; all things",
                },
                {
                  id: "q47",
                  question: "God exists within Himself in one perfect single act of delight and love, however everything He creates \"outside\" Himself He creates by different acts of delight and love.",
                  options: [
                    "True",
                    "False",
                  ],
                  correctAnswer: "False",
                },
                {
                  id: "q48",
                  question: "Why are the scriptural images describing God helpful?",
                  options: [
                    "Because they explain exactly what God is",
                    "Because they can sum up many attributes in one word",
                    "Because they make understanding God more abstract",
                    "All of the above",
                  ],
                  correctAnswer: "Because they can sum up many attributes in one word",
                },
                {
                  id: "q49",
                  question: "All of the attributes we say about God are meant in the infinite sense of those words, yet all point to His utter simplicity.",
                  options: [
                    "True",
                    "False",
                  ],
                  correctAnswer: "True",
                },
                {
                  id: "q50",
                  question: "God's knowledge of Himself is His Word, which in other words is His _____.",
                  options: [
                    "Divine Mystery",
                    "Holy Spirit",
                    "Son",
                    "None of the above",
                  ],
                  correctAnswer: "Son",
                },
              ],
            },
          },
          {
            id: "unit-10",
            title: "Who is God? (Part Three)",
            video: {
              id: "video-10",
              title: "Who is God? (Part Three)",
              videoUrl: "https://d3umrizzn3mmk.cloudfront.net/1.5.3+Small.mp4",
              questions: [
                {
                  id: "q51",                                                        
                  question: "The Holy Trinity is not a mystery.",
                  options: [
                    "True",
                    "False",
                  ],
                  correctAnswer: "False",
                },
                {
                  id: "q52",
                  question: "What do we mean by sacred mystery?",
                  options: [
                    "Something about God which is not possible to ever know or understand",
                    "Something about God which we can completely understand through prayer and study",
                    "Something about God which we now currently know little about but will understand in its fullness in the world to come",
                    "None of the above",
                  ],
                  correctAnswer: "Something about God which we now currently know little about but will understand in its fullness in the world to come",
                },
                {
                  id: "q53",
                  question: "The Mystery of the Incarnate Word is the most difficult mystery for the human intellect to understand.",
                  options: [
                    "True",
                    "False",
                  ],
                  correctAnswer: "True",
                },
                {
                  id: "q54",
                  question: "The Blessed Trinity is called the source of all mysteries because it refers to God at His deepest level.",
                  options: [
                    "True",
                    "False",
                  ],
                  correctAnswer: "True",
                },
                {
                  id: "q55",
                  question: "According to St. Thomas Aquinas, God reveals divine mysteries to us beyond our human comprehension in order to ______.",
                  options: [
                    "persuade and motivate us to be drawn to Him in the life to come.",
                    "make us understand all things about Him in this life.",
                    "make it clear that understanding everything about him is necessary for salvation",
                    "None of the above",
                  ],
                  correctAnswer: "persuade and motivate us to be drawn to Him in the life to come.",
                },
              ],
            },
          },
        ],
      },
      {
        id: "chapter-4",
        title: "Who is Man?",
        description: "Learn about the nature of man and his relationship to God.",
        backgroundImage: "/creationofadam.jpg",
        units: [
          {
            id: "unit-11",
            title: "Who is Man? (Part One)",
            video: {
              id: "video-11",
              title: "Who is Man? (Part One)",
              videoUrl: "https://d3umrizzn3mmk.cloudfront.net/1.6.1+Small.mp4",
              questions: [
                {
                  id: "q56",
                  question: "In philosophy, what do we mean when we speak of \"man\" in the broad sense?",
                  options: [
                    "All humanity",
                    "Male human beings",
                    "Adult human beings",
                    "None of the above",
                  ],
                  correctAnswer: "All humanity",
                },
                {
                  id: "q57",
                  question: "Man is a rational animal.",
                  options: [
                    "True",
                    "False",
                  ],
                  correctAnswer: "True",
                },
                {
                  id: "q58",
                  question: "In what way is man like God?",
                  options: [
                    "Insofar as Man is a created being",
                    "Insofar as man has unlimited power",
                    "According to his spirit which gives him the capacity for reason",
                    "All of the above",
                  ],
                  correctAnswer: "According to his spirit which gives him the capacity for reason",
                },
                {
                  id: "q59",
                  question: "How can man most perfectly know God?",
                  options: [
                    "Through reason alone",
                    "Through Divine Revelation alone",
                    "Though both reason and Divine Revelation",
                    "None of the above",
                  ],
                  correctAnswer: "Though both reason and Divine Revelation",
                },
                {
                  id: "q60",
                  question: "What is the argument proving the immortality of the soul?",
                  options: [
                    "Since it is a created soul it must be eternal since all creatures have eternal souls",
                    "Since it is invisible to the human eye it must be eternal",
                    "Since it is the rational part of man which can know eternal truths, it must also be eternal",
                    "No such argument exists",
                  ],
                  correctAnswer: "Since it is the rational part of man which can know eternal truths, it must also be eternal",
                },
              ],
            },
          },
          {
            id: "unit-12",
            title: "Philosophy of the Soul (Part Two)",
            video: {
              id: "video-12",
              title: "Philosophy of the Soul (Part Two)",
              videoUrl: "https://d3umrizzn3mmk.cloudfront.net/1.6.2+Small.mp4",
              questions: [
                {
                  id: "q61",
                  question: "Which of the following is an example of the first kind of name mentioned in the lesson?",
                  options: [
                    "A golden retriever",
                    "A dog",
                    "A old golden retriever",
                    "None of the above",
                  ],
                  correctAnswer: "A dog",
                },
                {
                  id: "q62",
                  question: "A man is an adult male human. In this definition, what function does the name male serve?",
                  options: [
                    "It is accidental and therefore completely unrelated",
                    "It signifies its own species",
                    "It signifies what the thing is",
                    "It is a proper and necessary effect of being a human being",
                  ],
                  correctAnswer: "It is a proper and necessary effect of being a human being",
                },
                {
                  id: "q63",
                  question: "According to gender ideology, the words male and female are used to incorrectly signify ______.",
                  options: [
                    "Proper and necessary effects of being human",
                    "Accidental qualities which are unrelated to being human",
                    "Essential differences of being human",
                    "All of the above",
                  ],
                  correctAnswer: "Accidental qualities which are unrelated to being human",
                },
                {
                  id: "q64",
                  question: "According to the ideology of radical feminism, the words male and female denote _____.",
                  options: [
                    "Two separate species",
                    "Proper and necessary effects of being human",
                    "Accidental qualities of being human",
                    "None of the above",
                  ],
                  correctAnswer: "Two separate species",
                },
                {
                  id: "q65",
                  question: "Which of the following includes an example of a name we call an accident?",
                  options: [
                    "A golden retriever",
                    "A dog",
                    "A old dog",
                    "None of the above",
                  ],
                  correctAnswer: "A old dog",
                },
              ],
            },
          },
        ],
      },
      {
        id: "chapter-5",
        title: "What is Sin?",
        description: "Learn about the nature of sin and its effects.",
        backgroundImage: "/801032ht.jpg",
        units: [
          {
            id: "unit-13",
            title: "What is Sin? (Part One)",
            video: {
              id: "video-13",
              title: "What is Sin? (Part One)",
              videoUrl: "https://d3umrizzn3mmk.cloudfront.net/1.7.1+Small.mp4",
              questions: [
                {
                  id: "q66",
                  question: "In its strictest sense, sin means that kind of defect that is grave enough (or mortal) to be a complete obstacle to the presence of _____in our soul.",
                  options: [
                    "happiness",
                    "grace",
                    "order",
                    "pleasure",
                  ],
                  correctAnswer: "grace",
                },
                {
                  id: "q67",
                  question: "Which of the following are qualities of sin?",
                  options: [
                    "It needs to be a defect in our behavior",
                    "It must come from us as a source",
                    "It has a negative effect on our relationship with God",
                    "All of the above",
                  ],
                  correctAnswer: "All of the above",
                },
                {
                  id: "q68",
                  question: "Although we are born into this world with Original Sin, all humans deserve to inherit eternal life.",
                  options: [
                    "True",
                    "False",
                  ],
                  correctAnswer: "False",
                },
                {
                  id: "q69",
                  question: "Why is sin such a serious matter?",
                  options: [
                    "It causes us to lose the presence of sanctifying grace in our soul",
                    "It is an obstacle to participating directly in the life of the Blessed Trinity",
                    "It puts the passions more at odds with the faculties of the soul",
                    "All of the above",
                  ],
                  correctAnswer: "All of the above",
                },
                {
                  id: "q70",
                  question: "Without the remedy of sanctifying grace, the soul after death can still exist in a state of complete union with God.",
                  options: [
                    "True",
                    "False",
                  ],
                  correctAnswer: "False",
                },
              ],
            },
          },
          {
            id: "unit-14",
            title: "What is Sin? (Part Two)",
            video: {
              id: "video-14",
              title: "What is Sin? (Part Two)",
              videoUrl: "https://d3umrizzn3mmk.cloudfront.net/1.7.2+Small.mp4",
              questions: [
                {
                  id: "q71",
                  question: "Our conscience is the combination of our ______ and our _____ resulting in our free choice to act for or against the will of God.",
                  options: [
                    "intellect; soul",
                    "will; thoughts",
                    "intellect; will",
                    "mind; soul",
                  ],
                  correctAnswer: "intellect; will",
                },
                {
                  id: "q72",
                  question: "The combination of a prideful self-centeredness with _____ is the nature of all sin.",
                  options: [
                    "laziness",
                    "skepticism",
                    "sensuality",
                    "criticism",
                  ],
                  correctAnswer: "sensuality",
                },
                {
                  id: "q73",
                  question: "Why do we call grave sin mortal?",
                  options: [
                    "Because we are mortal beings",
                    "Because this type of sin makes us spiritually dead",
                    "Because we can only make reparation for this type of sin in death",
                    "None of the above",
                  ],
                  correctAnswer: "Because this type of sin makes us spiritually dead",
                },
                {
                  id: "q74",
                  question: "Venial sin is a lighter form of sin in the sense that is a defective act that is easily pardoned.",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "True",
                },
                {
                  id: "q75",
                  question: "What is the ordinary way for the removal of sin?",
                  options: [
                    "Praying the Rosary",
                    "Doing works of charity",
                    "Mental prayer",
                    "Making a sacramental confession",
                  ],
                  correctAnswer: "Making a sacramental confession",
                },
              ]
            }
          },
        ],
      },
      {
        id: "chapter-6",
        title: "How are we saved?",
        description: "Learn about the nature of sin and its effects.",
        backgroundImage: "/304110rgsdl.jpg",
        units: [
          {
            id: "unit-15",
            title: "How are we saved? (Part One)",
            video: {
              id: "video-15",
              title: "How are we saved? (Part One)",
              videoUrl: "https://d3umrizzn3mmk.cloudfront.net/1.8.1+Small.mp4",
              questions: [
                {
                  id: "q76",
                  question: "How are we saved from Original Sin?",
                  options: [
                    "Christ became the new Adam so that we could forget about the sin of the first Adam",
                    "At the exact moment of the Incarnation, God erased all of the effects which original sin has on human nature",
                    "Through the merits of the Blessed Virgin Mary",
                    "God takes on our human nature while keeping his own divinity and offers himself as a sacrifice of expiation for the salvation of the world.",
                  ],
                  correctAnswer: "God takes on our human nature while keeping his own divinity and offers himself as a sacrifice of expiation for the salvation of the world.",
                },
                {
                  id: "q77",
                  question: "Is the Incarnation the only way to save the human race?",
                  options: [
                    "No, God could remit sin by His divine power",
                    "No, God doesn't have to do anything",
                    "Yes, otherwise it would be a candy-coated fix",
                    "Yes, because a man with infinite dignity has to make reparation and that is only achieved by the Incarnation",
                  ],
                  correctAnswer: "No, God could remit sin by His divine power",
                },
                {
                  id: "q78",
                  question: "The sacraments cannot give us the certainty that the merits of Christ are being applied to an individual person.",
                  options: [
                    "True",
                    "False",
                  ],
                  correctAnswer: "False",
                },
                {
                  id: "q79",
                  question: "Why can't man make reparation for his own sin?",
                  options: [
                    "Because we are too weak, now that we're fallen",
                    "Because no one would go through the crucifixion unless they were God",
                    "Because the sin of Adam and Eve was an offense against the infinite Uncreated God, whereas men are limited created beings",
                    "Because Adam was the only one who could, and he died too soon",
                  ],
                  correctAnswer: "Because the sin of Adam and Eve was an offense against the infinite Uncreated God, whereas men are limited created beings",
                },
                {
                  id: "q80",
                  question: "Why was the Incarnation an appropriate way to save the human race?",
                  options: [
                    "Because it is good to have God be one of us and take away the need for reparation",
                    "Because God wanted to have a new experience in sensing the world around Him",
                    "Because it was the only way it could be done",
                    "Because it was done through a human nature with divine power, satisfying the double need for human reparation and infinite power to repair",
                  ],
                  correctAnswer: "Because it was done through a human nature with divine power, satisfying the double need for human reparation and infinite power to repair",
                },
              ],
            },
          },
          {
            id: "unit-16",
            title: "How are we saved? (Part Two)",
            video: {
              id: "video-16",
              title: "How are we saved? (Part Two)",
              videoUrl: "https://d3umrizzn3mmk.cloudfront.net/1.8.2+Small.mp4",
              questions: [
                {
                  id: "q81",
                  question: "Why did Our Lord want to suffer and die?",
                  options: [
                    "Because suffering as poignantly as possible would show the lavish excess of his love.",
                    "Because without sacrifice there is no glory.",
                    "Because the harder thing is always better and more meritorious.",
                    "Because the more he suffered the more souls he could save.",
                  ],
                  correctAnswer: "Because suffering as poignantly as possible would show the lavish excess of his love.",
                },
                {
                  id: "q82",
                  question: "Can we say that all men must be saved for God to be just?",
                  options: [
                    "No, God is just in leveling punishment for sin.",
                    "Yes, we have to, since it's not fair that some are saved, and others aren't.",
                    "God's justice is ultimately absorbed in his mercy, so all men have to be saved for love to triumph.",
                    "The beauty of God's creation requires that all those in hell are eventually brought into heaven: all men must eventually be saved.",
                  ],
                  correctAnswer: "No, God is just in leveling punishment for sin.",
                },
                {
                  id: "q83",
                  question: "How does the resurrection crown the work of the passion?",
                  options: [
                    "By rising again, our Lord rebuilt the temple of his body, which fulfilled the earthly crowning glory of the temple of Solomon.",
                    "By rising, our Lord conquered death once and for all.",
                    "By rising, our Lord showed that he was finished with suffering altogether.",
                    "By his rising, our Lord shows the glorious effects of our salvation in his own person, which glory is the crown of our salvation.",
                  ],
                  correctAnswer: "By his rising, our Lord shows the glorious effects of our salvation in his own person, which glory is the crown of our salvation.",
                },
                {
                  id: "q84",
                  question: "Was the passion the only part of Christ's life which was meritorious for eternal life?",
                  options: [
                    "No, every action from the moment of Our Lord's conception was a cause for eternal life.",
                    "Yes, because it was the passion that paid the price of eternal redemption.",
                    "Yes, because the Bible only says that Christ died for our sins.",
                    "No, Christ became man and suffered to show his love, but it was his divine power alone which saved us.",
                  ],
                  correctAnswer: "No, every action from the moment of Our Lord's conception was a cause for eternal life.",
                },
                {
                  id: "q85",
                  question: "God is not unjust in leveling against the human race an eternal penalty for sin.",
                  options: [
                    "True",
                    "False",
                  ],
                  correctAnswer: "True",
                },
              ],
            },
          },
        ],
      },
    ],
  },
  {
    id: "semester-2",
    title: "Semester 2: The Catholic Faith",
    description: "Deepening understanding of Catholic doctrine and sacraments",
    backgroundImage: "/sm/532328ldsdl.jpeg",
    instructors: [
      {
        id: "instructor-2-1",
        name: "Fr. Ambrose Criste",
        description: "Fr. Ambrose Criste is a priest of the Diocese of Brooklyn and New York. He is a member of the Dominican Order and a member of the Dominican Friars of the Immaculate Conception.",
        profileImage: "/ambrose.png",
        role: "Lead Instructor",
        introductionVideo: "https://evermodecontent.s3.us-east-1.amazonaws.com/Fr.+Ambrose+Introduction.mp4"
      }
    ],
    chapters: [
      {
        id: "chapter-1",
        title: "Who is Jesus?",
        description: "Understanding the nature and person of Jesus Christ",
        backgroundImage: "/sm/500063ldsdl.jpeg",
        units: [
          {
            id: "unit-1",
            title: "Who is Jesus? (Part 1)",
            video: {
              id: "video-1",
              title: "Who is Jesus? (Part 1)",
              videoUrl: "https://d3umrizzn3mmk.cloudfront.net/2.1.1+Who+is+Jesus.mp4",
              questions: [
                {
                  id: "q1",
                  question: "\"I believe in Jesus Christ, His only Son, our Lord…\" comes from which prayer?",
                  options: [
                    "The Apostle's Creed.",
                    "The Athansian Creed",
                    "The Disciples' Creed",
                    "The Nicene Creed"
                  ],
                  correctAnswer: "The Apostle's Creed."
                },
                {
                  id: "q2",
                  question: "From which book of the Gospel do we hear the words of St. Peter proclaiming Christ as the \"Son of the living God\"?",
                  options: [
                    "Matthew",
                    "Mark",
                    "Luke",
                    "John"
                  ],
                  correctAnswer: "Matthew"
                },
                {
                  id: "q3",
                  question: "What does the name Jesus mean?",
                  options: [
                    "The Savior",
                    "The Anointed One",
                    "The Son of Man",
                    "The Son of God"
                  ],
                  correctAnswer: "The Savior"
                },
                {
                  id: "q4",
                  question: "In which Gospel do we hear about the logos becoming flesh and taking on a human nature?",
                  options: [
                    "Matthew",
                    "Mark",
                    "Luke",
                    "John"
                  ],
                  correctAnswer: "John"
                },
                {
                  id: "q5",
                  question: "Jesus Christ is two divine persons with one human nature.",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "False"
                }
              ]
            }
          },
          {
            id: "unit-2",
            title: "Who is Jesus? (Part 2)",
            video: {
              id: "video-2",
              title: "Who is Jesus? (Part 2)",
              videoUrl: "https://d3umrizzn3mmk.cloudfront.net/2.1.2+Who+is+Jesus.mp4",
              questions: [
                {
                  id: "q6",
                  question: "What is the theological term which describes the union of the two natures of Christ in the second person of the Trinity?",
                  options: [
                    "The hypothetical union",
                    "The divine union",
                    "The incarnational union",
                    "None of the above"
                  ],
                  correctAnswer: "None of the above"
                },
                {
                  id: "q7",
                  question: "The Greek word \"hypostasis\" means",
                  options: [
                    "Substance; that which lies beneath",
                    "Unison",
                    "Divine nature",
                    "Human nature"
                  ],
                  correctAnswer: "Substance; that which lies beneath"
                },
                {
                  id: "q8",
                  question: "Which ecumenical council of the Church defended the divine nature of Christ?",
                  options: [
                    "The First Council of Nicea",
                    "The Council of Trent",
                    "The First Vatican Council",
                    "The Second Vatican Council"
                  ],
                  correctAnswer: "The First Council of Nicea"
                },
                {
                  id: "q9",
                  question: "As a young boy, Christ slowly came to the realization that he possessed the Beatific Vision and was in fact God. This statement is an example of which theological tendency?",
                  options: [
                    "High Christology",
                    "Low Christology",
                    "Thomistic Christology",
                    "None of the above"
                  ],
                  correctAnswer: "Low Christology"
                },
                {
                  id: "q10",
                  question: "Which type of knowledge did Christ possess?",
                  options: [
                    "The Beatific Vision",
                    "Infused knowledge",
                    "Experiential knowledge",
                    "All of the above"
                  ],
                  correctAnswer: "All of the above"
                }
              ]
            }
          },
          {
            id: "unit-3",
            title: "Who is Jesus? (Part 3)",
            video: {
              id: "video-3",
              title: "Who is Jesus? (Part 3)",
              videoUrl: "https://d3umrizzn3mmk.cloudfront.net/2.1.3+Who+is+Jesus.mp4",
              questions: [
                {
                  id: "q11",
                  question: "Whenever we speak about the person of Jesus Christ, we cannot fail to speak about the Blessed Virgin Mary since the incarnation is closely tied to her person.",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "True"
                },
                {
                  id: "q12",
                  question: "Christ was conceived the same way as any other human being, that is, by way of the coming together of Joseph and Mary.",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "False"
                },
                {
                  id: "q13",
                  question: "Which of the following is NOT one of the privileges of the Blessed Virgin Mary?",
                  options: [
                    "Perpetual Virginity",
                    "Divinity",
                    "The Immaculate Conception",
                    "The Bodily Assumption into heaven"
                  ],
                  correctAnswer: "Divinity"
                },
                {
                  id: "q14",
                  question: "Theotokos means the \"God-bearer\" in which language?",
                  options: [
                    "Aramaic",
                    "Hebrew",
                    "Latin",
                    "Greek"
                  ],
                  correctAnswer: "Greek"
                },
                {
                  id: "q15",
                  question: "The virginal birth of Our Lord is a foreshadowing of which future event?",
                  options: [
                    "The Wedding Feast at Cana",
                    "The Baptism in the Jordan River",
                    "The Crucifixion",
                    "The Resurrection"
                  ],
                  correctAnswer: "The Resurrection"
                }
              ]
            }
          }
        ]
      },
      {
        id: "chapter-2",
        title: "What is the Church?",
        description: "Understanding the nature and mission of the Catholic Church",
        backgroundImage: "/sm/500063ldsdl.jpeg",
        units: [
          {
            id: "unit-4",
            title: "What is the Church? (Part 1)",
            video: {
              id: "video-4",
              title: "What is the Church? (Part 1)",
              videoUrl: "https://d3umrizzn3mmk.cloudfront.net/2.2.1+What+is+the+Church.mp4",
              questions: [
                {
                  id: "q16",
                  question: "From the Gospel of St. Matthew, we know that the Church is:",
                  options: [
                    "Founded by Christ himself as an identifiable institution of believers",
                    "Founded by Peter the Apostle with explicit authority from Christ",
                    "Founded by Christ himself as a symbolic institution",
                    "None of the above"
                  ],
                  correctAnswer: "Founded by Christ himself as an identifiable institution of believers"
                },
                {
                  id: "q17",
                  question: "\"Ecclesia\" is a Greek word which means",
                  options: [
                    "Unity",
                    "Followers",
                    "Assembly",
                    "Institution"
                  ],
                  correctAnswer: "Assembly"
                },
                {
                  id: "q18",
                  question: "The Catholic Church is the sole authority on the true interpretation of Sacred Scripture and doctrinal matters.",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "True"
                },
                {
                  id: "q19",
                  question: "The power to forgive sins was given by Christ solely to the apostles and not to their successors.",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "False"
                },
                {
                  id: "q20",
                  question: "The Pope is the successor to which Apostle?",
                  options: [
                    "Paul",
                    "John",
                    "James",
                    "Peter"
                  ],
                  correctAnswer: "Peter"
                }
              ]
            }
          },
          {
            id: "unit-5",
            title: "What is the Church? (Part 2)",
            video: {
              id: "video-5",
              title: "What is the Church? (Part 2)",
              videoUrl: "https://d3umrizzn3mmk.cloudfront.net/2.2.2+What+is+the+Church.mp4",
              questions: [
                {
                  id: "q21",
                  question: "The Eastern Orthodox churches, although they have valid sacraments, are not part of the Church founded by Christ.",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "False"
                },
                {
                  id: "q22",
                  question: "Why are Eastern Orthodox Christians separated from the visible body of believers, the Catholic Church?",
                  options: [
                    "Because they reject the belief of the Holy Eucharist",
                    "Because their baptisms are invalid",
                    "Because they reject the authority of the Pope over the body of all believers",
                    "All of the above"
                  ],
                  correctAnswer: "Because they reject the authority of the Pope over the body of all believers"
                },
                {
                  id: "q23",
                  question: "A person who is validly baptized in the name of the Holy Trinity but does not profess the Catholic Faith is known as a visible member of the Church.",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "False"
                },
                {
                  id: "q24",
                  question: "Christ gives all who profess belief in Him the authority to mediate graces on earth.",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "False"
                },
                {
                  id: "q25",
                  question: "A devout Buddhist, never knowing of Christ, but having a good heart and living a holy life, attains heaven upon his death. His divine reward is due to which of the following?",
                  options: [
                    "His belief in Buddhism",
                    "His invincible ignorance of Christ, which kept him from knowing the Truth,",
                    "The graces bestowed upon him through the Catholic Church by living a life which cooperated with the Truth, which is Christ.",
                    "His right to salvation which he has from birth"
                  ],
                  correctAnswer: "The graces bestowed upon him through the Catholic Church by living a life which cooperated with the Truth, which is Christ."
                }
              ]
            }
          }
        ]
      },
      {
        id: "chapter-3",
        title: "The Sacraments in General",
        description: "Understanding the nature and purpose of the sacraments",
        backgroundImage: "/sm/500063ldsdl.jpeg",
        units: [
          {
            id: "unit-6",
            title: "Sacraments in General (Part 1)",
            video: {
              id: "video-6",
              title: "Sacraments in General (Part 1)",
              videoUrl: "https://d3umrizzn3mmk.cloudfront.net/2.3.1+Sacraments+in+General.mp4",
              questions: [
                {
                  id: "q26",
                  question: "The sacraments are what type of signs?",
                  options: [
                    "Inward signs",
                    "Outward signs",
                    "Invisible signs",
                    "Secret signs"
                  ],
                  correctAnswer: "Outward signs"
                },
                {
                  id: "q27",
                  question: "What do all seven sacraments have in common?",
                  options: [
                    "They were instituted by Christ himself",
                    "They are signs which bestow sanctifying grace",
                    "They are prefigured in some way by Old Testament rituals",
                    "All of the above"
                  ],
                  correctAnswer: "All of the above"
                },
                {
                  id: "q28",
                  question: "How are the New Testament sacraments different from the ones found in the Old Testament?",
                  options: [
                    "Only the New Testament sacraments can be considered signs",
                    "As signs, the sacraments of the New Testament bestow the realities they represent",
                    "The number of New Testament sacraments exceeds the number of Old Testament ones",
                    "None of the above"
                  ],
                  correctAnswer: "As signs, the sacraments of the New Testament bestow the realities they represent"
                },
                {
                  id: "q29",
                  question: "Which sacrament is considered the most perfect sign?",
                  options: [
                    "Holy matrimony",
                    "The Eucharist",
                    "Baptism",
                    "Confirmation"
                  ],
                  correctAnswer: "The Eucharist"
                },
                {
                  id: "q30",
                  question: "Which sacrament deals with the life of the community of Christians?",
                  options: [
                    "Holy orders",
                    "Holy Eucharist",
                    "Baptism",
                    "Confirmation"
                  ],
                  correctAnswer: "Holy orders"
                }
              ]
            }
          },
          {
            id: "unit-7",
            title: "Sacraments in General (Part 2)",
            video: {
              id: "video-7",
              title: "Sacraments in General (Part 2)",
              videoUrl: "https://d3umrizzn3mmk.cloudfront.net/2.3.2+Sacraments+in+General.mp4",
              questions: [
                {
                  id: "q31",
                  question: "Grace is the inner life of the Holy Family dwelling in our souls.",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "False"
                },
                {
                  id: "q32",
                  question: "The only time God can dwell within our souls is momentarily during our reception of Holy Communion since this is when we actually receive Him into our bodies.",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "False"
                },
                {
                  id: "q33",
                  question: "Being in a state of grace means that we are living in the life of God and God is living in us.",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "True"
                },
                {
                  id: "q34",
                  question: "When the soul is in a state of grace it possesses habitual grace.",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "True"
                },
                {
                  id: "q35",
                  question: "Which sacrament cannot be received by mere desire?",
                  options: [
                    "Baptism",
                    "Holy Communion",
                    "Anointing of the sick",
                    "Holy orders"
                  ],
                  correctAnswer: "Holy orders"
                }
              ]
            }
          }
        ]
      },
      {
        id: "chapter-4",
        title: "The Sacraments of Initiation",
        description: "Understanding Baptism, Confirmation, and the Eucharist",
        backgroundImage: "/sm/500063ldsdl.jpeg",
        units: [
          {
            id: "unit-8",
            title: "The Sacraments of Initiation (Part 1)",
            video: {
              id: "video-8",
              title: "The Sacraments of Initiation (Part 1)",
              videoUrl: "https://d3umrizzn3mmk.cloudfront.net/2.4.1+The+Sacraments+of+Initiation.mp4",
              questions: [
                {
                  id: "q36",
                  question: "Which of the following is not a sacrament of initiation?",
                  options: [
                    "Holy orders",
                    "Baptism",
                    "Holy Communion",
                    "Confirmation"
                  ],
                  correctAnswer: "Holy orders"
                },
                {
                  id: "q37",
                  question: "The graces of the sacraments of initiation gradually wear off as we grow spiritually and physically into adult life.",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "False"
                },
                {
                  id: "q38",
                  question: "Which sacraments impose a character on the soul?",
                  options: [
                    "Holy Matrimony, confession, and Communion",
                    "Baptism and holy orders",
                    "Anointing of the sick and Communion",
                    "All of the above"
                  ],
                  correctAnswer: "Baptism and holy orders"
                },
                {
                  id: "q39",
                  question: "Which sacrament is a perfection of baptism, giving the soul the character to better defend the sacramental life?",
                  options: [
                    "Holy Communion",
                    "Confession",
                    "Confirmation",
                    "Anointing of the sick"
                  ],
                  correctAnswer: "Confirmation"
                },
                {
                  id: "q40",
                  question: "An adult who receives sanctifying grace from a pure intention and desire to be baptized, also receives the character of baptism.",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "False"
                }
              ]
            }
          },
          {
            id: "unit-9",
            title: "The Sacraments of Initiation (Part 2)",
            video: {
              id: "video-9",
              title: "The Sacraments of Initiation (Part 2)",
              videoUrl: "https://d3umrizzn3mmk.cloudfront.net/2.4.2+The+Sacraments+of+Initiation.mp4",
              questions: [
                {
                  id: "q41",
                  question: "Which stage of human life does the sacrament of baptism correspond with?",
                  options: [
                    "Maturity",
                    "Nourishment",
                    "Birth",
                    "End of life"
                  ],
                  correctAnswer: "Birth"
                },
                {
                  id: "q42",
                  question: "Which stage of human life does the sacrament of the Eucharist correspond with?",
                  options: [
                    "Maturity",
                    "Nourishment",
                    "Birth",
                    "End of life"
                  ],
                  correctAnswer: "Nourishment"
                },
                {
                  id: "q43",
                  question: "The sacraments can only be conferred in exact moments of human life, e.g. Baptism at birth, and Confirmation in adulthood.",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "False"
                },
                {
                  id: "q44",
                  question: "What is the matter of the sacrament of confirmation a symbol for?",
                  options: [
                    "Perfection and power",
                    "Healing and protection",
                    "Forgiveness of sins",
                    "Nourishment of the soul"
                  ],
                  correctAnswer: "Perfection and power"
                },
                {
                  id: "q45",
                  question: "The matter of the sacrament of the Holy Eucharist are the words \"This is my Body\" and \"This is the chalice of my Blood.\"",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "False"
                }
              ]
            }
          },
          {
            id: "unit-10",
            title: "The Sacraments of Initiation (Part 3)",
            video: {
              id: "video-10",
              title: "The Sacraments of Initiation (Part 3)",
              videoUrl: "https://d3umrizzn3mmk.cloudfront.net/2.4.3+The+Sacraments+of+Initiation.mp4",
              questions: [
                {
                  id: "q46",
                  question: "The sacraments of baptism and confirmation enable the soul to be able to worship God at the Mass by offering up the Eucharistic Sacrifice along with the priest.",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "True"
                },
                {
                  id: "q47",
                  question: "The second relation of the soul to the Eucharist is the spiritual nourishment received though the reception of Holy Communion.",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "True"
                },
                {
                  id: "q48",
                  question: "What do the sacramental appearances of the Eucharist as the Body and Blood of our Lord at the sacrifice of the Mass symbolize?",
                  options: [
                    "His resurrection",
                    "His death",
                    "His birth",
                    "All of the above"
                  ],
                  correctAnswer: "His death"
                },
                {
                  id: "q49",
                  question: "The Body and Blood of Christ are visible signs of food in the Holy Eucharist.",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "True"
                },
                {
                  id: "q50",
                  question: "All the other sacraments point in some way to the Holy Eucharist.",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "True"
                }
              ]
            }
          }
        ]
      },
      {
        id: "chapter-5",
        title: "The Mass - The Sacrifice of Calvary",
        description: "Understanding the nature and significance of the Mass",
        backgroundImage: "/sm/500063ldsdl.jpeg",
        units: [
          {
            id: "unit-11",
            title: "The Mass - The Sacrifice of Calvary (Part 1)",
            video: {
              id: "video-11",
              title: "The Mass - The Sacrifice of Calvary (Part 1)",
              videoUrl: "https://d3umrizzn3mmk.cloudfront.net/2.5.1+The+Mass+-+The+Sacrafice+of+Calvary.mp4",
              questions: [
                {
                  id: "q51",
                  question: "Which of the following can be considered a sacrifice?",
                  options: [
                    "A spoken prayer",
                    "A song of praise in church",
                    "Candles placed on the altar",
                    "All of the above"
                  ],
                  correctAnswer: "All of the above"
                },
                {
                  id: "q52",
                  question: "The identity of the Sacrifice of the Mass with the Sacrifice on Calvary is constituted by way of",
                  options: [
                    "Both sacrifices occurring in the same geographical places.",
                    "Both sacrifices happening at the same exact time in history.",
                    "Both sacrifices consist of the same sacrificial offering of Jesus Christ to the Father.",
                    "All of the above."
                  ],
                  correctAnswer: "Both sacrifices consist of the same sacrificial offering of Jesus Christ to the Father."
                },
                {
                  id: "q53",
                  question: "Christ gives us the sacramental sacrifice of the Mass so that we can have the possibility here on Earth to offer the ultimate sacrifice ourselves for our own salvation.",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "True"
                },
                {
                  id: "q54",
                  question: "The ordained priest is the principal offerer of the Holy Sacrifice of the Mass.",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "False"
                }
              ]
            }
          },
          {
            id: "unit-12",
            title: "The Mass - The Sacrifice of Calvary (Part 2)",
            video: {
              id: "video-12",
              title: "The Mass - The Sacrifice of Calvary (Part 2)",
              videoUrl: "https://d3umrizzn3mmk.cloudfront.net/2.5.2+The+Mass+-+The+Sacrafice+of+Calvary.mp4",
              questions: [
                {
                  id: "q55",
                  question: "Which of the following is NOT one of the ends for which the mass is offered?",
                  options: [
                    "To honor and glorify God",
                    "To give Thanksgiving to God for his many blessings",
                    "To give instruction on the Holy Scriptures to the Faithful",
                    "To ask God to grant our petitions"
                  ],
                  correctAnswer: "To give instruction on the Holy Scriptures to the Faithful"
                },
                {
                  id: "q56",
                  question: "What is the effect in our soul from participating at the Holy Sacrifice of the Mass?",
                  options: [
                    "Spiritual nourishment",
                    "Delight",
                    "An intensification of grace",
                    "All of the above"
                  ],
                  correctAnswer: "All of the above"
                },
                {
                  id: "q57",
                  question: "In order to participate in the mass, it is essential that we receive Holy Communion.",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "False"
                },
                {
                  id: "q58",
                  question: "A person who receives Communion properly disposed, but in a distracted manner, does not receive an increase of God's life and grace in their soul.",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "False"
                },
                {
                  id: "q59",
                  question: "Proper disposition for Holy Communion requires Catholics to",
                  options: [
                    "Pray the rosary daily",
                    "Be in a state of sanctifying grace",
                    "Have already received the Sacrament of Confirmation",
                    "All of the above"
                  ],
                  correctAnswer: "Be in a state of sanctifying grace"
                }
              ]
            }
          }
        ]
      },
      {
        id: "chapter-6",
        title: "The Holy Eucharist",
        description: "Understanding the nature and significance of the Eucharist",
        backgroundImage: "/sm/500063ldsdl.jpeg",
        units: [
          {
            id: "unit-13",
            title: "The Holy Eucharist (Part 1)",
            video: {
              id: "video-13",
              title: "The Holy Eucharist (Part 1)",
              videoUrl: "https://d3umrizzn3mmk.cloudfront.net/2.6.1+The+Holy+Eucharist.mp4",
              questions: [
                {
                  id: "q60",
                  question: "The sacrament of the Holy Eucharist is not part of the sacraments of initiation.",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "False"
                },
                {
                  id: "q61",
                  question: "Christ's teaching in John Chapter 6 was the only moment in His public ministry where a large group of his disciples lost their faith and followed Him no more. What was this controversial teaching?",
                  options: [
                    "The Beatitudes",
                    "Christ's divinity",
                    "The virgin birth",
                    "The Real Presence"
                  ],
                  correctAnswer: "The Real Presence"
                },
                {
                  id: "q62",
                  question: "Only the blood, soul, and divinity of Our Lord are present under the appearance of the wine at Mass.",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "False"
                },
                {
                  id: "q63",
                  question: "Christ's resurrected body as it exists right now in heaven is present in the Blessed Sacrament.",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "True"
                },
                {
                  id: "q64",
                  question: "What is the proper understanding of the word \"transubstantiation\"?",
                  options: [
                    "A complete change of one whole substance into another whole substance",
                    "A change of accidents into other accidents",
                    "A complete change of one whole substance and accidents into another whole substance and other accidents",
                    "None of the above"
                  ],
                  correctAnswer: "A complete change of one whole substance into another whole substance"
                }
              ]
            }
          },
          {
            id: "unit-14",
            title: "The Holy Eucharist (Part 2)",
            video: {
              id: "video-14",
              title: "The Holy Eucharist (Part 2)",
              videoUrl: "https://d3umrizzn3mmk.cloudfront.net/2.6.2+The+Holy+Eucharist.mp4",
              questions: [
                {
                  id: "q65",
                  question: "Judas Iscariot left to betray Christ before the institution of the Eucharist at the Last Supper.",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "False"
                },
                {
                  id: "q66",
                  question: "Which is an Old Testament prefigurement of the Holy Eucharist?",
                  options: [
                    "The miracle of the loaves and the fish",
                    "The passover lamb",
                    "The wine at the wedding feast of Cana",
                    "All of the above"
                  ],
                  correctAnswer: "The passover lamb"
                },
                {
                  id: "q67",
                  question: "The writings and teachings of the early church fathers are ambiguous when it comes to belief in the Real Presence of the Eucharist. This doctrine developed later in Church history.",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "False"
                },
                {
                  id: "q68",
                  question: "We call sacraments \"signs\". This means that they are symbolic rituals which are meant to represent earthly realities.",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "False"
                },
                {
                  id: "q69",
                  question: "The sacraments of the New Law differ from those of the Old Law in so far as they truly convey and contain the grace which they signify.",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "True"
                }
              ]
            }
          }
        ]
      },
      {
        id: "chapter-7",
        title: "Importance of Confession",
        description: "Understanding the sacrament of Reconciliation",
        backgroundImage: "/sm/500063ldsdl.jpeg",
        units: [
          {
            id: "unit-15",
            title: "Importance of Confession (Part 1)",
            video: {
              id: "video-15",
              title: "Importance of Confession (Part 1)",
              videoUrl: "https://d3umrizzn3mmk.cloudfront.net/2.7.1+Importance+of+Confession.mp4",
              questions: [
                {
                  id: "q70",
                  question: "When did Christ give his apostles the power to forgive sins?",
                  options: [
                    "On the night before he died",
                    "On Good Friday from the cross",
                    "On the day of His resurrection",
                    "On the day of His Ascension"
                  ],
                  correctAnswer: "On the day of His resurrection"
                },
                {
                  id: "q71",
                  question: "When we commit a sin, we only hurt God.",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "False"
                },
                {
                  id: "q72",
                  question: "In ordinary circumstances, the only way to receive forgiveness from God for our sins is by way of sacramental confession.",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "True"
                },
                {
                  id: "q73",
                  question: "When is it inappropriate to ask a priest to go to confession?",
                  options: [
                    "Outside of the set confession times",
                    "When the priest is not your pastor",
                    "When there isn't a proper confessional available",
                    "None of the above"
                  ],
                  correctAnswer: "None of the above"
                },
                {
                  id: "q74",
                  question: "Confession is more powerful than the Rite of Exorcism.",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "True"
                }
              ]
            }
          },
          {
            id: "unit-16",
            title: "Importance of Confession (Part 2)",
            video: {
              id: "video-16",
              title: "Importance of Confession (Part 2)",
              videoUrl: "https://d3umrizzn3mmk.cloudfront.net/2.7.2+Importance+of+Confession.mp4",
              questions: [
                {
                  id: "q75",
                  question: "Of the four acts of the sacrament of confession, three acts belong to the penitent, and only one belong to the priest.",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "True"
                },
                {
                  id: "q76",
                  question: "Which of the following is not a name for confession?",
                  options: [
                    "The sacrament of penance",
                    "The sacrament of reconciliation",
                    "The sacrament of retribution",
                    "The sacrament of forgiveness"
                  ],
                  correctAnswer: "The sacrament of retribution"
                },
                {
                  id: "q77",
                  question: "The act of the sacrament of confession which belongs to the priest is",
                  options: [
                    "Confession of one's sins",
                    "Contrition",
                    "Doing penance",
                    "Absolution"
                  ],
                  correctAnswer: "Absolution"
                },
                {
                  id: "q78",
                  question: "What is the examination of conscience?",
                  options: [
                    "Is when the priest interrogates the penitent about the nature of their sins",
                    "The act of saying one's sins to the priest",
                    "A test to see if the absolution from the priest really worked",
                    "None of the above"
                  ],
                  correctAnswer: "None of the above"
                },
                {
                  id: "q79",
                  question: "Only with the Pope's permission can a priest reveal the sins and identity of a penitent.",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "False"
                }
              ]
            }
          },
          {
            id: "unit-17",
            title: "Importance of Confession (Part 3)",
            video: {
              id: "video-17",
              title: "Importance of Confession (Part 3)",
              videoUrl: "https://d3umrizzn3mmk.cloudfront.net/2.7.3+Importance+of+Confession.mp4",
              questions: [
                {
                  id: "q80",
                  question: "The Act of Contrition consists of sorrow, hatred of sinful people, and a strong resolution to avoid sin.",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "False"
                },
                {
                  id: "q81",
                  question: "To be truly sorry for our sins we need to make a resolution to avoid the occasions which lead us into sin.",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "True"
                },
                {
                  id: "q82",
                  question: "Frequent confession is an excellent discipline to uproot habitual sins.",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "True"
                },
                {
                  id: "q83",
                  question: "For Catholics, the Sabbath day is which day of the week?",
                  options: [
                    "Saturday",
                    "Sunday",
                    "Friday",
                    "Christians do not observe the Sabbath"
                  ],
                  correctAnswer: "Sunday"
                },
                {
                  id: "q84",
                  question: "A man does not attend mass on a Sunday because he decides to go to his best friend's birthday celebration instead. This is serious enough of a reason to miss Sunday mass, and is without the penalty of sin.",
                  options: [
                    "True",
                    "False"
                  ],
                  correctAnswer: "False"
                }
              ]
            }
          }
        ]
      },
      {
        id: "chapter-8",
        title: "Prayer",
        description: "Understanding the nature and practice of prayer",
        backgroundImage: "/sm/500063ldsdl.jpeg",
        units: [
          {
            id: "unit-18",
            title: "Prayer (Part 1)",
            video: {
              id: "video-18",
              title: "Prayer (Part 1)",
              videoUrl: "https://d3umrizzn3mmk.cloudfront.net/2.8.1+Prayer.mp4",
              questions: [
                {
                  id: "q85",
                  question: "What is the purpose of prayer?",
                  options: [
                    "To communicate with God",
                    "To express our feelings",
                    "To ask for favors",
                    "To seek guidance"
                  ],
                  correctAnswer: "To communicate with God"
                },
                {
                  id: "q86",
                  question: "Which of the following is not a type of prayer?",
                  options: [
                    "Devotional prayer",
                    "Mental prayer",
                    "Loud prayer",
                    "Spiritual prayer"
                  ],
                  correctAnswer: "Loud prayer"
                },
                {
                  id: "q87",
                  question: "The most common form of prayer is",
                  options: [
                    "The Rosary",
                    "The Lord's Prayer",
                    "The Hail Mary",
                    "The Our Father"
                  ],
                  correctAnswer: "The Lord's Prayer"
                },
                {
                  id: "q88",
                  question: "The Rosary is a form of",
                  options: [
                    "Mental prayer",
                    "Spiritual prayer",
                    "Devotional prayer",
                    "All of the above"
                  ],
                  correctAnswer: "All of the above"
                },
                {
                  id: "q89",
                  question: "The Lord's Prayer is a form of",
                  options: [
                    "Spiritual prayer",
                    "Devotional prayer",
                    "Mental prayer",
                    "All of the above"
                  ],
                  correctAnswer: "Spiritual prayer"
                }
              ]
            }
          },
          {
            id: "unit-19",
            title: "Prayer (Part 2)",
            video: {
              id: "video-19",
              title: "Prayer (Part 2)",
              videoUrl: "https://d3umrizzn3mmk.cloudfront.net/2.8.2+Prayer.mp4",
              questions: [
                {
                  id: "q90",
                  question: "The Hail Mary is a form of",
                  options: [
                    "Spiritual prayer",
                    "Devotional prayer",
                    "Mental prayer",
                    "All of the above"
                  ],
                  correctAnswer: "Spiritual prayer"
                },
                {
                  id: "q91",
                  question: "The Our Father is a form of",
                  options: [
                    "Spiritual prayer",
                    "Devotional prayer",
                    "Mental prayer",
                    "All of the above"
                  ],
                  correctAnswer: "Spiritual prayer"
                },
                {
                  id: "q92",
                  question: "The Our Father is a form of",
                  options: [
                    "Spiritual prayer",
                    "Devotional prayer",
                    "Mental prayer",
                    "All of the above"
                  ],
                  correctAnswer: "Spiritual prayer"
                },
                {
                  id: "q93",
                  question: "The Hail Mary is a form of",
                  options: [
                    "Spiritual prayer",
                    "Devotional prayer",
                    "Mental prayer",
                    "All of the above"
                  ],
                  correctAnswer: "Spiritual prayer"
                },
                {
                  id: "q94",
                  question: "The Our Father is a form of",
                  options: [
                    "Spiritual prayer",
                    "Devotional prayer",
                    "Mental prayer",
                    "All of the above"
                  ],
                  correctAnswer: "Spiritual prayer"
                }
              ]
            }
          }
        ]
      }
    ]
  }
];

export default courseData;
