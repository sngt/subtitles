'use strict';

const LAST_YOUTUBE_VIDEO_ID_KEY = 'last_youtube_video_id';

const LAST_BROWSED_URL_KEY = 'last_browsed_url';
const LAST_OPENED_FILE_BODY_KEY = 'last_opened_file_body';

const Main = () => {
	switch ((location || window.location).pathname) {
		case '/youtube':
			return <YoutubeMain />;
		case '/srt':
			return <SrtMain />;
		default:
			return <IndexMain />;
	}
}



class IndexMain extends React.Component {
	render() {
		return(
			<main>
				<ul className="no-style">
					<li><a href="/youtube">Youtube</a></li>
					<li><a href="/srt">SRT</a></li>
				</ul>
			</main>
		);
	}
}



class YoutubeMain extends React.Component {
	getSubtitle (event) {
		event.preventDefault();

		const id = this.refs.videoId.state.id;
		if (id.match(/[a-zA-Z0-9\\-_]+/) === null) {
			alert(`Incorrect video id : ${id}`);
			return;
		}

		localStorage.setItem(LAST_YOUTUBE_VIDEO_ID_KEY, id);

		superagent
			.get(`http://video.google.com/timedtext?hl=en&lang=en&name=&v=${id}`)
			.end((err, res) => {
				if (err) {
					alert(err);
					return;
				}
				ReactDOM.render(<YoutubeSubtitle xmlBody={res.text} />, this.refs.result);
				ReactDOM.render(<FlexibleIFrame url={`https://www.youtube.com/embed/${id}?ecver=2`} ratio={0.8} />, this.refs.browser);
			});
	}

	render() {
		return(
			<main>
				<section className="subtitles">
					<form onSubmit={(e) => this.getSubtitle(e)}>
						<span>https://www.youtube.com/watch?v=</span>
						<YoutubeInput ref="videoId" />
						<button>GET</button>
					</form>

					<article ref="result"></article>
				</section>
				<section className="browser" ref="browser"></section>
			</main>
		);
	}
}

class YoutubeInput extends React.Component {
	constructor(props) {
		super(props);

		this.state = {id: localStorage.getItem(LAST_YOUTUBE_VIDEO_ID_KEY) || ''};
	}

	edit(event) {
		event.preventDefault();
		this.setState({id: event.target.value});
	}

	render() {
		return <input type="text" onChange={(e) => this.edit(e)} value={this.state.id} />;
	}
}

class YoutubeSubtitle extends React.Component {
	render() {
		const parser = new DOMParser();
		const dom = parser.parseFromString(this.props.xmlBody, 'text/xml');

		const list = [];
		dom.querySelectorAll('text').forEach((dom) => {
			list.push(dom.textContent.replace(/&#39;/g, '\'').replace(/&quot;/g, '"'));
		});

		return (
			<ol>
				{list.map((text, index) => <li key={index}>{text}</li>)}
			</ol>
		);
	}
}



class SrtMain extends React.Component {
	render() {
		return(
			<main>
				<section className="subtitles">
					<form>
						<SrtSelect ref="file" />
					</form>
					<article className="result">
						<SrtSubtitle />
					</article>
				</section>

				<section className="browser">
					<InternalBrowser />
				</section>
			</main>
		);
	}
}

class SrtSelect extends React.Component {
	select(event) {
		event.preventDefault();
		if (event.target.files.length <= 0) {
			return;
		}

		const data = event.target.files[0];
		if (data.name.match(/.srt$/) === null) {
			alert('The file must end with .srt.');
			event.target.value = '';
			return;
		}

		const reader = new FileReader();
		reader.onload = (event) => {
			const content = event.target.result.replace(/\r\n/g, '\n').replace(/\r/, '\n');
			const bodies = content.split('\n\n').map((block) => {
				return block.replace(/^[^\n]+\n[^\n]+\n/, '');
			});
			ReactDOM.render(<SrtSubtitle subtitles={bodies} />, document.querySelector('.subtitles .result'));

		};
		reader.readAsText(data);
	}

	render() {
		return (
			<input type="file" onChange={(e) => this.select(e)} />
		);
	}
}

class SrtSubtitle extends React.Component {
	render() {
		if (this.props.subtitles) {
			localStorage.setItem(LAST_OPENED_FILE_BODY_KEY, JSON.stringify(this.props.subtitles));
		} else {
			this.props.subtitles = JSON.parse(localStorage.getItem(LAST_OPENED_FILE_BODY_KEY)) || [];
		}

		return (
			<ol>
				{this.props.subtitles.map((body, index) => {
					return (
						<li key={index}>
							{body.split('\n').map((line, index) => <p key={index}>{line}</p>)}
						</li>
					)
				})}
			</ol>
		);
	}
}


class InternalBrowser extends React.Component {
	constructor(props) {
		super(props);
		this.state = {url: localStorage.getItem(LAST_BROWSED_URL_KEY) || ''};
	}

	edit(event) {
		event.preventDefault();
		this.setState({url: event.target.value});
	}

	show(event) {
		event.preventDefault();
		localStorage.setItem(LAST_BROWSED_URL_KEY, this.refs.url.value);
		ReactDOM.render(<FlexibleIFrame url={this.refs.url.value} />, this.refs.content);
	}

	render() {
		return (
			<section>
				<form onSubmit={(e) => this.show(e)}>
					<input type="text" ref="url" value={this.state.url} onChange={(e) => this.edit(e)} />
					<button>SHOW</button>
				</form>
				<article ref="content"></article>
			</section>
		);
	}
}

class FlexibleIFrame extends React.Component {
	constructor(props) {
		super(props);
		this.style = {height: document.documentElement.clientHeight * (props.ratio || 1)};
	}

	render() {
		return <iframe src={this.props.url} style={this.style}></iframe>;
	}
}

ReactDOM.render(<Main />, document.querySelector('#root'));
