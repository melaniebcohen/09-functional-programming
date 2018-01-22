'use strict';

var app = app || {};

(function(module) {

  var Article = {};  

function Article(rawDataObj) {
  // REVIEW: In Lab 8, we explored a lot of new functionality going on here. Let's re-examine the concept of context. Normally, "this" inside of a constructor function refers to the newly instantiated object. However, in the function we're passing to forEach, "this" would normally refer to "undefined" in strict mode. As a result, we had to pass a second argument to forEach to make sure our "this" was still referring to our instantiated object. One of the primary purposes of lexical arrow functions, besides cleaning up syntax to use fewer lines of code, is to also preserve context. That means that when you declare a function using lexical arrows, "this" inside the function will still be the same "this" as it was outside the function. As a result, we no longer have to pass in the optional "this" argument to forEach!
  Object.keys(rawDataObj).forEach(key => this[key] = rawDataObj[key]);
}

Article.all = [];

Article.prototype.toHtml = function() {
  var template = Handlebars.compile($('#article-template').text());

  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);
  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';
  this.body = marked(this.body);

  return template(this);
};

Article.loadAll = rawData => {
  rawData.sort((a,b) => (new Date(b.publishedOn)) - (new Date(a.publishedOn)))
  
  var newArr = rawData.map(article => { return (new Article(article)) })

  Article.all = newArr;
  console.log('Articles instantiated:',Article.all)
};

Article.fetchAll = callback => {
  $.get('/articles')
    .then(results => {
      Article.loadAll(results);
      // callback();
    })
};

Article.numWordsAll = () => {
  // get a rough count of all words in all articles
  // map -> get all words in each article
  // reduce -> sum all those totals together
  return Article.all.map(article => { 
    return article.body.split(' ').length;
  }).reduce((prev,cur) => {
    return prev + cur;
  });
};

Article.allAuthors = () => {
  // produce an array of unique author names. You will probably need to use the optional accumulator argument in your reduce call
  // map -> get all authors in array
  return Article.all.map(article => {
    return article.author;
  }).reduce((acc,cur) => {
    // acc is accumulator, cur is current
    if (acc.indexOf(cur) === -1) {
      acc.push(cur);
    }
    return acc;
  }, []);
}

Article.numWordsByAuthor = () => {
// receives results from allAuthors function (5 authors)
// map returns object literal with two properties - author's name, number of words from author (which will require more than just map)
  // var allAuthors = Article.allAuthors().map(author => {
  //   var authorObj = {};
  //   authorObj.name = author;
  //   return authorObj;
  // })

  // console.log(allAuthors);

  var authorStats = Article.allAuthors().map(author => {
    console.log(author)
    Article.all.filter(article => {
      // if the authors match, return all article lengths fo
      if (author === article.author) {
        var words = article.body.split(' ').length;
        console.log(words)
      }
    })
})
}

Article.truncateTable = callback => {
  $.ajax({
    url: '/articles',
    method: 'DELETE',
  })
    .then(console.log)
  // REVIEW: Check out this clean syntax for just passing 'assumed' data into a named function! The reason we can do this has to do with the way Promise.prototype.then() works. It's a little outside the scope of 301 material, but feel free to research!
    .then(callback);
};

Article.prototype.insertRecord = function(callback) {
  // REVIEW: Why can't we use an arrow function here for .insertRecord()?
  $.post('/articles', {author: this.author, authorUrl: this.authorUrl, body: this.body, category: this.category, publishedOn: this.publishedOn, title: this.title})
    .then(console.log)
    .then(callback);
};

Article.prototype.deleteRecord = function(callback) {
  $.ajax({
    url: `/articles/${this.article_id}`,
    method: 'DELETE'
  })
    .then(console.log)
    .then(callback);
};

Article.prototype.updateRecord = function(callback) {
  $.ajax({
    url: `/articles/${this.article_id}`,
    method: 'PUT',
    data: {
      author: this.author,
      authorUrl: this.authorUrl,
      body: this.body,
      category: this.category,
      publishedOn: this.publishedOn,
      title: this.title,
      author_id: this.author_id
    }
  })
    .then(console.log)
    .then(callback);
};

module.Article = Article;
// module.Article.all = Article.all;

})(window);