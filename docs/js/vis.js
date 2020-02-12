
clout.exec('tosca.lib.utils');

var nodes = [];
var edges = [];

var colorNode = 'rgb(100,200,255)';
var colorPolicy = 'rgb(255,165,0)';
var colorSubstitution = 'rgb(150,200,255)';
var colorWorkflow = 'rgb(100,255,100)';

for (var id in clout.vertexes) {
	var vertex = clout.vertexes[id];
	addVertex(id, vertex);
}

function addVertex(id, vertex) {
	var node = {
		id: id,
		label: id,
		data: tosca.isTosca(vertex) ? vertex.properties : vertex
	};

	if (tosca.isTosca(vertex, 'NodeTemplate'))
		addNodeTemplate(node);
	else if (tosca.isTosca(vertex, 'Group'))
		addGroup(node);
	else if (tosca.isTosca(vertex, 'Policy'))
		addPolicy(node);
	else if (tosca.isTosca(vertex, 'Substitution'))
		addSubstitution(node);
	else if (tosca.isTosca(vertex, 'Workflow'))
		addWorkflow(node);
	else if (tosca.isTosca(vertex, 'WorkflowStep'))
		addWorkflowStep(node);
	else if (tosca.isTosca(vertex, 'WorkflowActivity'))
		addWorkflowActivity(node);
	else
		node.data = vertex;

	nodes.push(node);

	for (var e = 0, l = vertex.edgesOut.length; e < l; e++)
		addEdge(id, vertex.edgesOut[e]);
}

function addEdge(id, e) {
	var edge = {
		from: id,
		to: e.targetID,
		arrows: {
			to: true
		},
		font: {
			align: 'middle'
		},
		smooth: {type: 'dynamic'},
		length: 300,
		data: tosca.isTosca(e) ? e.properties : e
	};

	if (tosca.isTosca(e, 'Relationship'))
		addRelationship(edge);
	else if (tosca.isTosca(e, 'RequirementMapping'))
		addRequirementMapping(edge);
	else if (tosca.isTosca(e, 'CapabilityMapping'))
		addCapabilityMapping(edge);
	else if (tosca.isTosca(e, 'PropertyMapping'))
		addPropertyMapping(edge);
	else if (tosca.isTosca(e, 'InterfaceMapping'))
		addInterfaceMapping(edge);
	else if (tosca.isTosca(e, 'OnFailure'))
		addOnFailure(edge);
	else
		edge.data = e;

	edges.push(edge);
}

function addNodeTemplate(node) {
	node.label = node.data.name;
	node.shape = 'box';
	node.color = colorNode;
}

function addGroup(node) {
	node.label = node.data.name;
	node.shape = 'circle';
	node.color = colorNode;
}

function addPolicy(node) {
	node.label = node.data.name;
	node.shape = 'circle';
	node.color = colorPolicy;
}

function addRelationship(edge) {
	edge.label = edge.data.name;
	edge.color = {color: colorNode};
}

function addSubstitution(node) {
	node.label = 'substitution';
	node.shape = 'box';
	node.color = colorSubstitution;
	node.shapeProperties = {borderDashes: true};
}

function addRequirementMapping(edge) {
	edge.label = 'requirement\n' + edge.data.requirement;
	edge.color = {color: colorSubstitution};
	edge.dashes = true;
}

function addCapabilityMapping(edge) {
	edge.label = 'capability\n' + edge.data.capability;
	edge.color = {color: colorSubstitution};
	edge.dashes = true;
}

function addPropertyMapping(edge) {
	edge.label = 'property\n' + edge.data.property;
	edge.color = {color: colorSubstitution};
	edge.dashes = true;
}

function addInterfaceMapping(edge) {
	edge.label = 'interface\n' + edge.data.interface;
	edge.color = {color: colorSubstitution};
	edge.dashes = true;
}

function addWorkflow(node) {
	node.label = node.data.name;
	node.shape = 'diamond';
	node.color = colorWorkflow;
}

function addWorkflowStep(node) {
	node.label = node.data.name;
	node.shape ='diamond';
	node.color = colorWorkflow;
}

function addOnFailure(edge) {
	edge.label = 'onFailure';
	edge.color = {color: 'rgb(255,100,100)'};
}

function addWorkflowActivity(node) {
	node.label = node.data.name;
	node.shape = 'triangle';
	node.color = colorWorkflow;
}

puccini.format = 'json';
puccini.write({
	nodes: nodes,
	edges: edges
});
