const { AuthenticationError } = require('apollo-server-express');
const { Book, User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        // By adding context to our query, we can retrieve the logged in user without specifically searching for them
        me: async (parent, args, context) => {
            if (context.user) {
              return User.findOne({ _id: context.user._id });
            }
            throw new AuthenticationError('You need to be logged in!');
          }
    },
    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
      
            if (!user) {
              throw new AuthenticationError('No user with this email found!');
            }
      
            const correctPw = await user.isCorrectPassword(password);
      
            if (!correctPw) {
              throw new AuthenticationError('Incorrect password!');
            }
      
            const token = signToken(user);
            return { token, user };
        },
        addUser: async (parent, { username, email, password }) => {
         
            const user = await User.create({ username, email, password });
            const token = signToken(user);
           
        },
        createDay: async (parent, { input }, context) => {
            
          if (context.user) {
               
              const newDay = await Day.create({input});
               
              const updatedUser = await User.findOneAndUpdate(
                  {_id: context.user._id},
                  {
                      $addToSet: {days: input},
                  },
                  {
                      new: true,
                      runValidators: true,
                  }
              );
              return updatedUser;
          }
           // If user attempts to execute this mutation and isn't logged in, throw an error
          throw new AuthenticationError('You need to be logged in!');
      },

    }
}

module.exports = resolvers;
