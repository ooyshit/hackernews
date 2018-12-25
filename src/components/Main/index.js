import React, { Component } from 'react';
import axios from 'axios';

import './index.css';

import {
  DEFAULT_QUERY, DEFAULT_HPP, PATH_BASE, PATH_SEARCH, PARAM_SEARCH, PARAM_PAGE, PARAM_HPP,
} from '../../constants';

import { ButtonWithLoading } from '../Button';
import Search from '../Search';
import Table from '../Table';


class Main extends Component {
  _isMounted = false;

  state = {
    results: null,
    searchTerm: DEFAULT_QUERY,
    searchKey: '',
    error: null,
    isLoading: false,
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  setSearchTopStories(result) {
    const { hits, page } = result;
    this.setState(prevState => {
      const { searchKey, results } = prevState;
      const oldHits = results && results[searchKey]
        ? results[searchKey].hits
        : [];
      const updatedHits = [
        ...oldHits,
        ...hits
      ];
      return {
        results: {
          ...results,
          [searchKey]: { hits: updatedHits, page }
        },
        isLoading: false
      };
    });
  }

  needsToSearchTopStories = (searchTerm) => {
    return !this.state.results[searchTerm];
  }

  fetchSearchTopStories = (searchTerm, page = 0) => {
    this.setState({ isLoading: true });
    axios.get(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(result => this._isMounted && this.setSearchTopStories(result.data))
      .catch(error => this._isMounted && this.setState({ error }));
  }

  onSearchSubmit = (e) => {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    if (this.needsToSearchTopStories(searchTerm)) {
      this.fetchSearchTopStories(searchTerm);
    }
    e.preventDefault();
  }

  onDismiss = (id) => {
    const { searchKey, results } = this.state;
    const { hits, page } = results[searchKey];
    const updatedHits = hits.filter(item => item.objectID !== id);
    this.setState({
      results: {
        ...results,
        [searchKey]: { hits: updatedHits, page }
      }
    });
  }

  onSearchChange = (e) => {
    this.setState({ searchTerm: e.target.value });
  }

  componentDidMount() {
    this._isMounted = true;
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    this.fetchSearchTopStories(searchTerm);
  }

  render() {
    const {
      searchTerm,
      results,
      searchKey,
      error,
      isLoading,
    } = this.state;

    const page = (
      results &&
      results[searchKey] &&
      results[searchKey].page
    ) || 0;
    const list = (
      results &&
      results[searchKey] &&
      results[searchKey].hits
    ) || [];

    return (
      <div className="page">
        <div className="interactions">
          <Search
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}
            value={searchTerm}
          >
            Поиск
          </Search>
        </div>
        {error ?
          <div className="interactions">
            <p>Something went wrong.</p>
          </div>
          :
          <Table
            list={list}
            onDismiss={this.onDismiss}
          />
        }
        <div className="interactions">
          <ButtonWithLoading
            onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}
            isLoading={isLoading}
          >
            More
            </ButtonWithLoading>
        </div>
      </div>
    );
  }
}

export default Main;