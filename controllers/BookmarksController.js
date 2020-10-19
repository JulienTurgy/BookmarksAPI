/*const { stringify } = require('querystring');
const Repository = require('../models/Repository');
const { get } = require('http');*/
const Repository = require('../models/Repository');
const Bookmark = require('../models/bookmark');
const url = require('url');
const { strict } = require('assert');
const { capitalizeFirstLetter } = require('../utilities');

module.exports = 
class bookmarksController extends require('./Controller') {
    constructor(req, res){
        super(req, res);
        this.bookmarksRepository = new Repository('Bookmarks');
    }
    get(id){
      let params = this.getQueryStringParams();
      if(!isNaN(id))
          this.response.JSON(this.bookmarksRepository.get(id));
      else if(params == null)
          this.response.JSON(this.bookmarksRepository.getAll());
      else if(Object.keys(params).length === 0)
          this.help();
      else {
          var filteredBookmarks = this.bookmarksRepository.getAll();
          //recherche avec nom
          if('name' in params){
              if(params.name.includes('*')) {
                var searched = params.name.replace('*', '');
                filteredBookmarks = filteredBookmarks.filter(function (bm){
                  return bm["Name"].includes(searched);
                });
              } 
              else {
                var searched = capitalizeFirstLetter(params.name);
                filteredBookmarks = filteredBookmarks.filter(function (bm){
                  return bm["Name"] == searched;
                });
              }
          }
          //recherge avec categorie
          if('category' in params){
              if(params.category.includes('*')) {
                  var searched = params.category.replace('*', '');
                  filteredBookmarks = filteredBookmarks.filter(function (bm){
                  return bm["Category"].includes(searched);
                  });
              } 
              else {
                  var searched = capitalizeFirstLetter(params.category);
                  filteredBookmarks = filteredBookmarks.filter(function (bm){
                    return bm["Category"] == searched;
                  });
                }
          }
          if('sort' in params){
              switch (params.sort){
                case 'name':
                  filteredBookmarks.sort(function (a,b) {
                    return (a["Name"] > b["Name"] ? 1 : -1)
                  });
                  break;
                case 'category':
                  filteredBookmarks.sort(function (a,b) {
                    return (a["Category"] < b["Category"] ? 1 : -1)
                  });
                  break;
              }
            }
          //Renvoi la liste des bookmarks apres traitements
          this.response.JSON(filteredBookmarks);
      }
    }
    // POST: api/bookmarks body payload[{Name": "...", "URL": "...", "Category": "..."}]
    post(bmData){ 
      if(!this.bookmarkExists(bmData.Name, bmData.Url))
      {
        let newBookmark = new Bookmark(
          capitalizeFirstLetter(bmData.Name), 
          bmData.Url, 
          capitalizeFirstLetter(bmData.Category)
        );

        if (newBookmark){
          this.bookmarksRepository.add(newBookmark);
          this.response.created(newBookmark);
        }
        else
            this.response.internalError();
      }
      else{
          this.response.conflict();
      }
    }
    // PUT: api/bookmarks body payload[{"Id":..., "Name": "...", "URL": "...", "Category": "..."}]
    put(bmData){
      let bookmark = null;
      if(!isNaN(bmData.Id)){
        bookmark = this.bookmarksRepository.get(bmData.Id);
        if(bookmark){
          if(bookmark.Name)
            bookmark.Name = capitalizeFirstLetter(bmData.Name);
          if(bookmark.Url)
            bookmark.Url = bmData.Url
          if(bookmark.Category)
            bookmark.Category = capitalizeFirstLetter(bmData.Category)
          if (this.bookmarksRepository.update(bookmark))
            this.response.ok();
        else 
          //bookmark not found
          this.response.notFound();
        }
      }
      else
        //id is NaN
        this.response.unprocessable();
    }
    // DELETE: api/bookmarks/{id}
    remove(id){
      let bookmark = null;
      if(!isNaN(id)){
        bookmark = this.bookmarksRepository.get(id);
        if(bookmark){
          if (this.bookmarksRepository.remove(id))
              this.response.accepted();
          else
              this.response.notFound();
        }      
        else 
          //bookmark not found
          this.response.notFound();
      }
        else
          //id is NaN
          this.response.unprocessable();
    }

    help() {
      // expose all the possible query strings
      let content = "<div style=font-family:arial>";
      content += "<h3>GET : api/bookmarks endpoint  <br> List of de parametres possibles:</h3><hr>";
      content += "<h4>GET: 	/api/bookmarks				voir tous les bookmarks</h4>";
      content += "<h4>GET: 	/api/bookmarks?sort=\"name\"		voir tous les bookmarks triés ascendant par Name</h4>";
      content += "<h4>GET: 	/api/bookmarks?sort=\"category\"	voir tous les bookmarks triés descendant par Category";
      content += "<h4>GET: 	/api/bookmarks/id			voir le bookmark Id";
      content += "<h4>GET: 	/api/bookmark?name=\"nom\"		voir le bookmark avec Name = nom</h4>";
      content += "<h4>GET: 	/api/bookmark?name=\"ab*\" 		voir tous les bookmarks avec Name commençant par ab</h4>";
      content += "<h4>GET: 	/api/bookmark?category=\"sport\"	voir tous les bookmarks avec Category = sport</h4>";
      content += "<h4>GET: 	/api/bookmark?				Voir la liste des paramètres supportés</h4>";
      content += "<h4>POST: 	/api/bookmarks				Ajout d’un bookmark</h4>";
      content += "<h4>PUT: 	/api/bookmarks/Id			Modifier le bookmark Id</h4>";
      content += "<h4>PUT: 	/api/bookmarks/Id			Modifier le bookmark Id</h4>";
      this.res.writeHead(200, {'content-type':'text/html'});
      this.res.end(content) + "</div>";
    }

    bookmarkExists(name, url){
      const bookmark = this.bookmarksRepository.getAll();
      let bmExists = false;
      for (let i = 0; i < bookmark.length; i++){
        if(bookmark[i].Name == name || bookmark[i].Url == url)
          bmExists = true;
      }
      return bmExists;
  }
}