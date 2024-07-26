

export const difficultyButtons = {
    type: 'button',
    button: {
      body: {
        type: 'text',
        text: {
          body: 'Select Difficulty',
        },
      },
      buttons: [
        {
          type: 'solid',
          body: 'Easy',
          reply: 'Easy',
        },
        {
          type: 'solid',
          body: 'Medium',
          reply: 'Medium',
        },
        {
          type: 'solid',
          body: 'Hard',
          reply: 'Hard',
        },
      ],
      allow_custom_response: false,
    },
  };
  
  export const nextQuestionButtons = {
    type: 'button',
    button: {
      body: {
        type: 'text',
        text: {
          body: 'What would you like to do next?',
        },
      },
      buttons: [
        {
          type: 'solid',
          body: 'Next Question',
          reply: 'Next Question',
        },
        {
          type: 'solid',
          body: 'Main Menu',
          reply: 'Main Menu',
        },
      ],
      allow_custom_response: false,
    },
  };
  
  export const spellingButtons = (options: string[]) => ({
    type: 'button',
    button: {
      body: {
        type: 'text',
        text: {
          body: 'Choose the correct spelling:',
        },
      },
      buttons: options.map((option) => ({
        type: 'solid',
        body: option,
        reply: option,
      })),
      allow_custom_response: false,
    },
  });
  