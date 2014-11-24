/*global angular */

/**
 * Services that persists and retrieves todos from localStorage or a backend API
 * if available.
 *
 * They both follow the same API, returning promises for all changes to the
 * model.
 */
angular.module('todomvc')
		.factory('todoStorage', function ($http, $q) {
			'use strict';

			// You would normally want to pass this in as some sort of config.
			var apiUri = "http://api2.cs1.voodle.de",
			//var apiUri = "http://127.0.0.1:5000",
					store = {
						todos: [],
						username: "Dave",

						clearCompleted: function () {
							var originalTodos = store.todos.slice(0);

							var completeTodos = [], incompleteTodos = [], promises;
							store.todos.forEach(function (todo) {
								if (todo.completed) {
									completeTodos.push(todo);
								} else {
									incompleteTodos.push(todo);
								}
							});

							angular.copy(incompleteTodos, store.todos);

							promises = _.map(completeTodos, function (todo) {
								return $http.delete(apiUri + '/todos/' + todo.id, {params: {username: store.username}})
									.then(function success() {
										return true;
									}, function error() {
										return false;
									});
							});

							return $q.all(promises).then(function (results) {
								if (_.every(results)) {
									return store.todos;
								} else {
									angular.copy(originalTodos, store.todos);
									return originalTodos;
								}
							});
						},

						delete: function (todo) {
							var originalTodos = store.todos.slice(0);

							store.todos.splice(store.todos.indexOf(todo), 1);

							return $http.delete(apiUri + '/todos/' + todo.id, {params: {username: store.username}})
									.then(function success() {
										return store.todos;
									}, function error() {
										angular.copy(originalTodos, store.todos);
										return originalTodos;
									});
						},

						get: function () {
							$http.get(apiUri + '/todos', {params: {username: store.username}})
									.then(function (resp) {
										angular.copy(resp.data, store.todos);
										return store.todos;
									});
						},

						create: function (todo) {
							var originalTodos = store.todos.slice(0);

							return $http.post(apiUri + '/todos', todo, {params: {username: store.username}})
									.then(function success(resp) {
										todo.id = resp.data.id;
										store.todos.push(todo);
										return store.todos;
									}, function error() {
										angular.copy(originalTodos, store.todos);
										return store.todos;
									});
						},

						put: function (todo) {
							var originalTodos = store.todos.slice(0);

							return $http.put(apiUri + '/todos/' + todo.id, todo, {params: {username: store.username}})
									.then(function success() {
										return store.todos;
									}, function error() {
										angular.copy(originalTodos, store.todos);
										return originalTodos;
									});
						},

						login: function (username) {
							return $http.post(apiUri + '/login/' + username, "", {params: {username: store.username}})
									.then(function success() {
										return true;
									}, function error() {
										return false;
									});
						},

						logout: function () {
							return $http.post(apiUri + '/logout', "", {params: {username: store.username}})
									.then(function success() {
										return true;
									}, function error() {
										return false;
									});
						}
					};

			return store;
		});
