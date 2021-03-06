import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getSearchResults } from '../api/spotify';
import Button from '../styles/Button';
import { colors } from '../styles/theme';

const Container = styled.div`
	min-height: calc(100vh);
	margin: 2em;
	padding-bottom: 2em;
	@media (max-width: 768px) {
		margin: 2em 1em;
	}
	> div {
		margin: 2em 0;
	}
`;

const TextBox = styled.div`
	@media (max-width: 480px) {
		background: white;
		color: black;
		padding: 1px 15px;
		border-radius: 10px;
	}
	> p {
		line-height: 1.5em;
	}
`;

const InputGroup = styled.div`
	margin: 20px auto;
	max-width: 400px;
	label {
		font-size: 1.25em;
		display: block;
		padding-bottom: 5px;
	}
	input {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid transparent;
		border-radius: 4px;
		color: #fff;
		font-size: 14px;
		height: 40px;
		width: 100%;
		box-sizing: border-box;
		padding: 0 12px;
	}
`;

const Suggestions = styled.div`
	margin: 1em 0;
	background: rgba(255, 255, 255, 0.1);
	padding: 1em;
	border-radius: 5px;
	> div {
		white-space: nowrap;
		overflow: scroll;
		/* Hide scrollbar for Chrome, Safari and Opera */
		&::-webkit-scrollbar {
			display: none;
		}
		/* Hide scrollbar for IE, Edge and Firefox */
		-ms-overflow-style: none; /* IE and Edge */
		scrollbar-width: none; /* Firefox */
		> div {
			width: 128px;
			display: inline-block;
			margin: 0 20px 0 0;
			text-align: center;
			> img {
				&:hover {
					opacity: 0.5;
					cursor: pointer;
				}
			}
			> p {
				text-overflow: ellipsis;
				overflow: hidden;
				margin: 5px 0;
				white-space: normal;
				font-size: 12px;
				height: 27.5px;
				display: -webkit-box;
				-webkit-line-clamp: 2; /* number of lines to show */
				-webkit-box-orient: vertical;
			}
		}
	}
`;

const SuggestionType = styled.button`
	background: none;
	border: none;
	color: white;
	margin: 0 1em 1em 0;
	padding: 0 0 5px 0;
	font-size: 16px;
	border-bottom: ${({ selected }) => selected && 'solid 1px'};
`;

const Link = styled.a`
	font-weight: bold;
	color: ${colors.green};
	text-decoration: none;
`;

const AlignCenter = styled.div`
	text-align: center;
`;

const Choose = ({ collections, onCollectionUpdate, onCompare }) => {
	const [inputValues, setInputValues] = useState(['', '']);
	const [searchTimeout, setSearchTimeout] = useState(null);
	const [suggestions, setSuggestions] = useState(null);

	useEffect(() => {
		const collectionNames = collections.map((collection) => collection?.name || '');
		setInputValues(collectionNames);
		clearTimeout(searchTimeout);
		setSuggestions(null);
	}, [collections]);

	const handleInputChange = async (index, value) => {
		inputValues[index] = value;
		setInputValues(inputValues.slice());
		onCollectionUpdate(index, value);
		clearTimeout(searchTimeout);
		if (value) {
			const timeout = setTimeout(async () => {
				const { albums, playlists, artists } = await getSearchResults(value);
				const updatedSuggestions = {
					selectedType: suggestions ? suggestions.selectedType : 'Playlists',
					collectionIndex: index,
					Playlists: playlists.items,
					Albums: albums.items,
					Artists: artists.items,
				};
				setSuggestions(updatedSuggestions);
				window.scrollTo(0, 0);
			}, 275);
			setSearchTimeout(timeout);
		} else {
			setSuggestions(null);
		}
	};

	const handleSuggestionClick = (suggestion) => {
		const index = suggestions.collectionIndex;
		inputValues[index] = suggestion.name;
		onCollectionUpdate(index, suggestion.external_urls.spotify, suggestion);
		setInputValues(inputValues.slice());
		setSuggestions(null);
	};

	const showSideNav = () => {
		const sideNav = document.getElementById('side-nav');
		sideNav.style.display = 'block';
	};

	const handleCompareClick = () => {
		return collections[0] && collections[1] ? onCompare() : alert('Choose two collections before clicking Compare');
	};

	const handleOpenSuggestion = (e, collectionUrl, name) => {
		if (window.confirm(`Open ${name} in Spotify?`)) {
			window.open(collectionUrl);
		}
	};

	return (
		<Container>
			{!suggestions && (
				<TextBox>
					<h2>Choose two collections.</h2>
					<p>
						Select a playlist from <Link onClick={showSideNav}>Your Library</Link>, search and browse for playlists,
						albums, and artists, or{' '}
						<Link href='https://open.spotify.com/search' target='_blank'>
							{' '}
							Open Spotify
						</Link>{' '}
						to copy any collection's <i>share</i> link.
					</p>
				</TextBox>
			)}
			<div>
				{['A', 'B'].map((side, index) =>
					suggestions && suggestions.collectionIndex !== index ? null : (
						<InputGroup key={index}>
							<label>Side {side}</label>
							<input
								placeholder='Search and browse or paste a link...'
								key={index}
								onChange={(e) => handleInputChange(index, e.target.value)}
								value={inputValues[index]}
							/>
						</InputGroup>
					)
				)}
				{suggestions && (
					<Suggestions>
						{['Playlists', 'Albums', 'Artists'].map((type) => (
							<SuggestionType
								selected={type === suggestions.selectedType}
								onClick={() => setSuggestions({ ...suggestions, selectedType: type })}
							>
								{type}
							</SuggestionType>
						))}
						<div>
							{suggestions[suggestions.selectedType].map((suggestion) => (
								<div>
									<img
										height='128px'
										width='128px'
										onClick={() => handleSuggestionClick(suggestion)}
										src={suggestion.images[0]?.url}
									/>
									<p>{suggestion.name}</p>
									<Button
										xs
										white
										onClick={(e) => handleOpenSuggestion(e, suggestion.external_urls.spotify, suggestion.name)}
									>
										Open Spotify
									</Button>
								</div>
							))}
						</div>
					</Suggestions>
				)}
			</div>
			{!suggestions && (
				<AlignCenter>
					<Button onClick={handleCompareClick}>Compare</Button>
				</AlignCenter>
			)}
		</Container>
	);
};

export default Choose;
