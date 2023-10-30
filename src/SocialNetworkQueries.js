export class SocialNetworkQueries {
  mostLikedBooksFromLastUserFriends = [];

  constructor({ fetchCurrentUser }) {
    this.fetchCurrentUser = fetchCurrentUser;
  }

  async findPotentialLikes(minimalScore) {
    let userWithFriendsBooksLikes = {};
    let mostLikedBooks = {};

    try {
      userWithFriendsBooksLikes = await this.fetchCurrentUser().catch(t=> {
        console.log(v)
      });
    } catch (error) {
        console.log(error);

      if (this.mostLikedBooksFromLastUserFriends.length != 0) {
        return this.returnBooksByScore(minimalScore);
      } else {
        return [];
      }
    }

    for (const friend of userWithFriendsBooksLikes.friends) {
      friend.likes = new Set(friend.likes); // Making sure there is no duplicate
      for (const likedBook of friend.likes) {
        if (!userWithFriendsBooksLikes.likes.includes(likedBook)) {
          if (mostLikedBooks[likedBook]) {
            mostLikedBooks[likedBook].likes += 1;
            mostLikedBooks[likedBook].score =
              mostLikedBooks[likedBook].likes /
              userWithFriendsBooksLikes.friends.length;
          } else {
            mostLikedBooks[likedBook] = {
              likes: 1,
              score: 1 / userWithFriendsBooksLikes.friends.length,
            };
          }
        }
      }
    }

    this.mostLikedBooksFromLastUserFriends = this.sortLikedBooks(
      Object.entries(mostLikedBooks)
    );

    return this.returnBooksByScore(minimalScore);
  }

  returnBooksByScore(minimalScore) {
    return this.filterBooksOnScore(
      this.mostLikedBooksFromLastUserFriends,
      minimalScore
    ).map((mostLikedBook) => mostLikedBook[0]);
  }

  filterBooksOnScore(booksWithScores, minimalScore) {
    return booksWithScores.filter(([_, obj]) => obj.score > minimalScore);
  }

  sortLikedBooks(likedBooks) {
    return likedBooks.sort(([titleA, a], [titleB, b]) => {
      // Compare by "score" first
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      // If scores are the same, compare by "title"
      return titleA.localeCompare(titleB, "en", { sensitivity: "base" });
    });
  }
}
