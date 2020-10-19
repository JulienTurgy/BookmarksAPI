exports.initBookmarks = function (){
    const BookmarksRepository = require('./Repository.js');
    const Bookmark = require('./bookmark');
    const bookmarksRepository = new BookmarksRepository("bookmarks");
    bookmarksRepository.add(new Bookmark('Glitch','Glitch.com','Programmation'));
}