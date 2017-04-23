'use strict';

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
		if (id.match(/[a-zA-Z0-9\\-]+/) === null) {
			alert(`Incorrect video id : ${id}`);
			return;
		}

		superagent
			.get(`http://video.google.com/timedtext?hl=en&lang=en&name=&v=${id}`)
			.end((err, res) => {
				if (err) {
					alert(err);
					return;
				}
				ReactDOM.render(<YoutubeSubtitle xmlBody={res.text} />, this.refs.result);
			});
	}

	render() {
		return(
			<main>
				<form onSubmit={(e) => this.getSubtitle(e)}>
					<span>https://www.youtube.com/watch?v=</span>
					<YoutubeInput ref="videoId" />
					<button>GET</button>
				</form>

				<section ref="result"></section>
			</main>
		);
	}
}

class YoutubeInput extends React.Component {
	constructor(props) {
		super(props);

		this.state = {id: ''};
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
	getSubtitle (event) {
		event.preventDefault();

		const dir = this.refs.file.state.dir;
		const name = this.refs.file.state.name;
		superagent
			.get(encodeURI(`/api/srt/content?dir=${dir}&name=${name}`))
			.end((err, res) => {
				if (err) {
					alert(err);
					return;
				}
				console.log(res.body);
				ReactDOM.render(<SrtSubtitle subtitles={res.body} />, this.refs.result);
			});
	}

	render() {
		return(
			<main>
				<form>
					<SrtSelect ref="file" />
					<button onClick={(e) => this.getSubtitle(e)}>GET</button>
				</form>

				<section ref="result"></section>
			</main>
		);
	}
}

class SrtSelect extends React.Component {
	constructor(props) {
		super(props);

		superagent
			.get('/api/srt/list')
			.end((err, res) => {
				if (err) {
					alert(err);
					return;
				}

				if (res.body.length <= 0) {
					alert('There is no SRT file.');
					return;
				}

				const defaultFile = res.body[0];
				this.setState({
					files: res.body,
					path: `${defaultFile.dir}/${defaultFile.name}`,
					dir: defaultFile.dir,
					name: defaultFile.name
				});
			});

		this.state = {files: [], path:'', dir: '', name: ''};
	}

	select(event) {
		event.preventDefault();
		this.setState({
			path: event.target.value,
			dir: event.target.dir,
			name: event.target.name
		});
	}

	render() {
		return (
			<select onChange={(e) => this.select(e)} value={this.state.path}>
				{this.state.files.map((file) => {
					const path = `${file.dir}/${file.name}`
					return <option key={path} dir={file.dir} name={file.name}>{path}</option>;
				})}
			</select>
		);
	}
}

class SrtSubtitle extends React.Component {
	render() {
		return (
			<ol>
				{this.props.subtitles.map((block) => {
					return (
						<li key={block.number}>
							{block.text.split('\n').map((line, index) => <p key={index}>{line}</p>)}
						</li>
					)
				})}
			</ol>
		);
	}
}



ReactDOM.render(<Main />, document.querySelector('#root'));
