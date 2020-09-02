
		////////////
		/* set up */
		////////////

		var instructions_on = 1; // you can turn off (0) the first two instructions screens if you want to test (since the participant recording test takes a bit)

		var num_blocks = 2; // will repeat each block of stimuli this number of times (blocked together)
		var num_tr_blocks = 1; // number of training blocks (same principle as num_blocks)
		var window_height = window.innerHeight; // get the window height in pixels	
		var stim_height = { // stimulus height in pixels - height is auto (i.e. will maintain aspect ratio)
			small: window_height*0.1,
			medium: window_height*0.3,
			large: window_height*0.5
		} 

		var timeline = []; // initialise timeline
		
		//////////////////
		/* instructions */
		//////////////////	

		var instructions_on_start = {
			type: 'html-keyboard-response',
			stimulus:"<p>In this experiment you'll see images on the screen and respond by speaking aloud.<br>You'll need to allow microphone access in your browser if you haven't already.<br>Be sure to 'remember the decision' so you don't get prompted every time.<br>There are four different task in this experiment.<br>Each one is slightly different, although all are similar.<br>At the start of each task, you'll get some instructions.<br>Then there will be a short 'training' period during which we'll tell you the correct answer after each trial.<br>Then you'll start the block properly and you won't get any feedback until the next block.<br><br>When ready, press any key continue.</p>"
		}

		/* intro to the recording trial */
		var participant_test = {
			type: 'image-audio-response',
			stimulus: 'stimuli/tiny-welcome.png', // an invisible img that takes up no space on the screen
			prompt: "<p>Recording has started. Speak!<br>This trial just let's you test things out.<br>You can see the recording indicator at the bottom right of the screen.<br>This example trial records for 6 seconds and at the end you can play it back or rerecord as you like.<br>In the experiment itself, you will not be able to playback, or rerecord.</p>",
			allow_playback: true,
			buffer_length: 6000,
			wait_for_mic_approval: true,
			recording_light: '<div style="position: fixed; bottom: 0; right: 0;">recording...</div>',
			recording_light_off: '<div style="position: fixed; bottom: 0; right: 0;">not recording...</div>'
		}

		/* push those to the timeline, if instructions are on */
		if (instructions_on == 1) {
			timeline.push(instructions_on_start);
			timeline.push(participant_test);
		}

		//////////////////////
		/* instruction bits */
		//////////////////////

		/* report size instructions */
		var size_instructions = {
			type: 'html-keyboard-response',
			stimulus: '<p>In this version of the task, you must report the <em>size</em> of the image by speaking aloud.<br>It will be either small, medium, or large.<br>Please watch the centre of the screen between images!<br><br>Press any key to continue.</p>',
		}

		/* report colour instructions */
		var colour_instructions = {
			type: 'html-keyboard-response',
			stimulus: '<p>In this version of the task, you must report the <em>colour</em> of the image by speaking aloud.<br>It will be either red, blue, or green.<br>Please watch the centre of the screen between images!<br><br>Press any key to continue.</p>',
		}

		/* pre item instructions */
		var pre_training = {
			type: 'html-keyboard-response',
			stimulus: 'We will start with a block of training, and we will give you feedback each trial.<br><br> Press any key to continue.</p>',
		}
		var pre_test = {
			type: 'html-keyboard-response',
			stimulus: 'Now we begin the test. You will no longer recieve feedback.<br>Please answer as fast and as accurately as possible.<br><br> Press any key to continue.</p>',
		}

		/* finished task instructions */
		var finished_task = {
			type: 'html-keyboard-response',
			stimulus: "You've finished this version of the task. Well done.<br><br>Press any key to continue.</p>",
		}

		//////////////////
		/* trial blocks */
		//////////////////

		/* feedback objects we can call later when we put together the procedure */
		size_feedback = {
			type: 'html-keyboard-response',
			stimulus: function(){
				var size_string = jsPsych.data.get().last(1).values()[0].size;
				return '<p> correct answer: '+JSON.stringify(size_string)+'</p>';
			},
			choices: jsPsych.NO_KEYS,
			trial_duration: 600,
		}
		colour_feedback = {
			type: 'html-keyboard-response',
			stimulus: function(){
				var colour_string = jsPsych.data.get().last(1).values()[0].colour;
				return '<p> correct answer: '+JSON.stringify(colour_string)+'</p>';
			},
			choices: jsPsych.NO_KEYS,
			trial_duration: 600,
		}

		/* stroop task */
		var stroop_task = {
			timeline: [
				{
					type: 'html-keyboard-response',
					stimulus: '<div style="font-size:60px;">+</div>',
					choices: jsPsych.NO_KEYS,
					trial_duration: 300
				},
				{
					type: 'image-audio-response',
					stimulus: jsPsych.timelineVariable('stim_path'),
					allow_playback: false,
					buffer_length: 2000,
					wait_for_mic_approval: false,
					stimulus_height: jsPsych.timelineVariable('stim_size'),
					recording_light: '<div style="position: fixed; bottom: 0; right: 0;">recording...</div>',
					recording_light_off: '<div style="position: fixed; bottom: 0; right: 0;">not recording...</div>',
					data: jsPsych.timelineVariable('add_data')
				}
			],
			timeline_variables: [
				{stim_path: 'stimuli/red-red.svg', stim_size: stim_height.small, add_data: {stimulus: 'red-red-small', size: 'small', colour: 'red', congruency: 'congruent'}},
				{stim_path: 'stimuli/red-red.svg', stim_size: stim_height.small, add_data: {stimulus: 'red-red-small', size: 'small', colour: 'red', congruency: 'congruent'}},
				{stim_path: 'stimuli/red-blue.svg', stim_size: stim_height.small, add_data: {stimulus: 'red-blue-small', size: 'small', colour: 'blue', congruency: 'incongruent'}},
				{stim_path: 'stimuli/red-green.svg', stim_size: stim_height.small, add_data: {stimulus: 'red-green-small', size: 'small', colour: 'green', congruency: 'incongruent'}},
				{stim_path: 'stimuli/blue-blue.svg', stim_size: stim_height.small, add_data: {stimulus: 'blue-blue-small', size: 'small', colour: 'blue', congruency: 'congruent'}},
				{stim_path: 'stimuli/blue-blue.svg', stim_size: stim_height.small, add_data: {stimulus: 'blue-blue-small', size: 'small', colour: 'blue', congruency: 'congruent'}},
				{stim_path: 'stimuli/blue-red.svg', stim_size: stim_height.small, add_data: {stimulus: 'blue-red-small', size: 'small', colour: 'red', congruency: 'incongruent'}},
				{stim_path: 'stimuli/blue-green.svg', stim_size: stim_height.small, add_data: {stimulus: 'blue-green-small', size: 'small', colour: 'green', congruency: 'incongruent'}},
				{stim_path: 'stimuli/green-green.svg', stim_size: stim_height.small, add_data: {stimulus: 'green-green-small', size: 'small', colour: 'green', congruency: 'congruent'}},
				{stim_path: 'stimuli/green-green.svg', stim_size: stim_height.small, add_data: {stimulus: 'green-green-small', size: 'small', colour: 'green', congruency: 'congruent'}},
				{stim_path: 'stimuli/green-red.svg', stim_size: stim_height.small, add_data: {stimulus: 'green-red-small', size: 'small', colour: 'red', congruency: 'incongruent'}},
				{stim_path: 'stimuli/green-blue.svg', stim_size: stim_height.small, add_data: {stimulus: 'green-blue-small', size: 'small', colour: 'blue', congruency: 'incongruent'}},
				{stim_path: 'stimuli/red-red.svg', stim_size: stim_height.medium, add_data: {stimulus: 'red-red-medium', size: 'medium', colour: 'red', congruency: 'congruent'}},
				{stim_path: 'stimuli/red-red.svg', stim_size: stim_height.medium, add_data: {stimulus: 'red-red-medium', size: 'medium', colour: 'red', congruency: 'congruent'}},
				{stim_path: 'stimuli/red-blue.svg', stim_size: stim_height.medium, add_data: {stimulus: 'red-blue-medium', size: 'medium', colour: 'blue', congruency: 'incongruent'}},
				{stim_path: 'stimuli/red-green.svg', stim_size: stim_height.medium, add_data: {stimulus: 'red-green-medium', size: 'medium', colour: 'green', congruency: 'incongruent'}},
				{stim_path: 'stimuli/blue-blue.svg', stim_size: stim_height.medium, add_data: {stimulus: 'blue-blue-medium', size: 'medium', colour: 'blue', congruency: 'congruent'}},
				{stim_path: 'stimuli/blue-blue.svg', stim_size: stim_height.medium, add_data: {stimulus: 'blue-blue-medium', size: 'medium', colour: 'blue', congruency: 'congruent'}},
				{stim_path: 'stimuli/blue-red.svg', stim_size: stim_height.medium, add_data: {stimulus: 'blue-red-medium', size: 'medium', colour: 'red', congruency: 'incongruent'}},
				{stim_path: 'stimuli/blue-green.svg', stim_size: stim_height.medium, add_data: {stimulus: 'blue-green-medium', size: 'medium', colour: 'green', congruency: 'incongruent'}},
				{stim_path: 'stimuli/green-green.svg', stim_size: stim_height.medium, add_data: {stimulus: 'green-green-medium', size: 'medium', colour: 'green', congruency: 'congruent'}},
				{stim_path: 'stimuli/green-green.svg', stim_size: stim_height.medium, add_data: {stimulus: 'green-green-medium', size: 'medium', colour: 'green', congruency: 'congruent'}},
				{stim_path: 'stimuli/green-red.svg', stim_size: stim_height.medium, add_data: {stimulus: 'green-red-medium', size: 'medium', colour: 'red', congruency: 'incongruent'}},
				{stim_path: 'stimuli/green-blue.svg', stim_size: stim_height.medium, add_data: {stimulus: 'green-blue-medium', size: 'medium', colour: 'blue', congruency: 'incongruent'}},
				{stim_path: 'stimuli/red-red.svg', stim_size: stim_height.large, add_data: {stimulus: 'red-red-large', size: 'large', colour: 'red', congruency: 'congruent'}},
				{stim_path: 'stimuli/red-red.svg', stim_size: stim_height.large, add_data: {stimulus: 'red-red-large', size: 'large', colour: 'red', congruency: 'congruent'}},
				{stim_path: 'stimuli/red-blue.svg', stim_size: stim_height.large, add_data: {stimulus: 'red-blue-large', size: 'large', colour: 'blue', congruency: 'incongruent'}},
				{stim_path: 'stimuli/red-green.svg', stim_size: stim_height.large, add_data: {stimulus: 'red-green-large', size: 'large', colour: 'green', congruency: 'incongruent'}},
				{stim_path: 'stimuli/blue-blue.svg', stim_size: stim_height.large, add_data: {stimulus: 'blue-blue-large', size: 'large', colour: 'blue', congruency: 'congruent'}},
				{stim_path: 'stimuli/blue-blue.svg', stim_size: stim_height.large, add_data: {stimulus: 'blue-blue-large', size: 'large', colour: 'blue', congruency: 'congruent'}},
				{stim_path: 'stimuli/blue-red.svg', stim_size: stim_height.large, add_data: {stimulus: 'blue-red-large', size: 'large', colour: 'red', congruency: 'incongruent'}},
				{stim_path: 'stimuli/blue-green.svg', stim_size: stim_height.large, add_data: {stimulus: 'blue-green-large', size: 'large', colour: 'green', congruency: 'incongruent'}},
				{stim_path: 'stimuli/green-green.svg', stim_size: stim_height.large, add_data: {stimulus: 'green-green-large', size: 'large', colour: 'green', congruency: 'congruent'}},
				{stim_path: 'stimuli/green-green.svg', stim_size: stim_height.large, add_data: {stimulus: 'green-green-large', size: 'large', colour: 'green', congruency: 'congruent'}},
				{stim_path: 'stimuli/green-red.svg', stim_size: stim_height.large, add_data: {stimulus: 'green-red-large', size: 'large', colour: 'red', congruency: 'incongruent'}},
				{stim_path: 'stimuli/green-blue.svg', stim_size: stim_height.large, add_data: {stimulus: 'green-blue-large', size: 'large', colour: 'blue', congruency: 'incongruent'}}, 
			],
			randomize_order: true,
			// 'repetitions:' would go here, but we will assign this more dynamically later
		}

		/* false font task */
		var false_font_task = {
			timeline: [
				{
					type: 'html-keyboard-response',
					stimulus: '<div style="font-size:60px;">+</div>',
					choices: jsPsych.NO_KEYS,
					trial_duration: 300
				},
				{
					type: 'image-audio-response',
					stimulus: jsPsych.timelineVariable('stim_path'),
					allow_playback: false,
					buffer_length: 2000,
					wait_for_mic_approval: false,
					stimulus_height: jsPsych.timelineVariable('stim_size'),
					recording_light: '<div style="position: fixed; bottom: 0; right: 0;">recording...</div>',
					recording_light_off: '<div style="position: fixed; bottom: 0; right: 0;">not recording...</div>',
					data: jsPsych.timelineVariable('add_data')
				}
			],
			timeline_variables: [
				{stim_path: 'stimuli/ffred-red.svg', stim_size: stim_height.small, add_data: {stimulus: 'ffred-red-small', size: 'small', colour: 'red', congruency: 'congruent'}},
				{stim_path: 'stimuli/ffred-red.svg', stim_size: stim_height.small, add_data: {stimulus: 'ffred-red-small', size: 'small', colour: 'red', congruency: 'congruent'}},
				{stim_path: 'stimuli/ffred-blue.svg', stim_size: stim_height.small, add_data: {stimulus: 'ffred-blue-small', size: 'small', colour: 'blue', congruency: 'incongruent'}},
				{stim_path: 'stimuli/ffred-green.svg', stim_size: stim_height.small, add_data: {stimulus: 'ffred-green-small', size: 'small', colour: 'green', congruency: 'incongruent'}},
				{stim_path: 'stimuli/ffblue-blue.svg', stim_size: stim_height.small, add_data: {stimulus: 'ffblue-blue-small', size: 'small', colour: 'blue', congruency: 'congruent'}},
				{stim_path: 'stimuli/ffblue-blue.svg', stim_size: stim_height.small, add_data: {stimulus: 'ffblue-blue-small', size: 'small', colour: 'blue', congruency: 'congruent'}},
				{stim_path: 'stimuli/ffblue-red.svg', stim_size: stim_height.small, add_data: {stimulus: 'ffblue-red-small', size: 'small', colour: 'red', congruency: 'incongruent'}},
				{stim_path: 'stimuli/ffblue-green.svg', stim_size: stim_height.small, add_data: {stimulus: 'ffblue-green-small', size: 'small', colour: 'green', congruency: 'incongruent'}},
				{stim_path: 'stimuli/ffgreen-green.svg', stim_size: stim_height.small, add_data: {stimulus: 'ffgreen-green-small', size: 'small', colour: 'green', congruency: 'congruent'}},
				{stim_path: 'stimuli/ffgreen-green.svg', stim_size: stim_height.small, add_data: {stimulus: 'ffgreen-green-small', size: 'small', colour: 'green', congruency: 'congruent'}},
				{stim_path: 'stimuli/ffgreen-red.svg', stim_size: stim_height.small, add_data: {stimulus: 'ffgreen-red-small', size: 'small', colour: 'red', congruency: 'incongruent'}},
				{stim_path: 'stimuli/ffgreen-blue.svg', stim_size: stim_height.small, add_data: {stimulus: 'ffgreen-blue-small', size: 'small', colour: 'blue', congruency: 'incongruent'}},
				{stim_path: 'stimuli/ffred-red.svg', stim_size: stim_height.medium, add_data: {stimulus: 'ffred-red-medium', size: 'medium', colour: 'red', congruency: 'congruent'}},
				{stim_path: 'stimuli/ffred-red.svg', stim_size: stim_height.medium, add_data: {stimulus: 'ffred-red-medium', size: 'medium', colour: 'red', congruency: 'congruent'}},
				{stim_path: 'stimuli/ffred-blue.svg', stim_size: stim_height.medium, add_data: {stimulus: 'ffred-blue-medium', size: 'medium', colour: 'blue', congruency: 'incongruent'}},
				{stim_path: 'stimuli/ffred-green.svg', stim_size: stim_height.medium, add_data: {stimulus: 'ffred-green-medium', size: 'medium', colour: 'green', congruency: 'incongruent'}},
				{stim_path: 'stimuli/ffblue-blue.svg', stim_size: stim_height.medium, add_data: {stimulus: 'ffblue-blue-medium', size: 'medium', colour: 'blue', congruency: 'congruent'}},
				{stim_path: 'stimuli/ffblue-blue.svg', stim_size: stim_height.medium, add_data: {stimulus: 'ffblue-blue-medium', size: 'medium', colour: 'blue', congruency: 'congruent'}},
				{stim_path: 'stimuli/ffblue-red.svg', stim_size: stim_height.medium, add_data: {stimulus: 'ffblue-red-medium', size: 'medium', colour: 'red', congruency: 'incongruent'}},
				{stim_path: 'stimuli/ffblue-green.svg', stim_size: stim_height.medium, add_data: {stimulus: 'ffblue-green-medium', size: 'medium', colour: 'green', congruency: 'incongruent'}},
				{stim_path: 'stimuli/ffgreen-green.svg', stim_size: stim_height.medium, add_data: {stimulus: 'ffgreen-green-medium', size: 'medium', colour: 'green', congruency: 'congruent'}},
				{stim_path: 'stimuli/ffgreen-green.svg', stim_size: stim_height.medium, add_data: {stimulus: 'ffgreen-green-medium', size: 'medium', colour: 'green', congruency: 'congruent'}},
				{stim_path: 'stimuli/ffgreen-red.svg', stim_size: stim_height.medium, add_data: {stimulus: 'ffgreen-red-medium', size: 'medium', colour: 'red', congruency: 'incongruent'}},
				{stim_path: 'stimuli/ffgreen-blue.svg', stim_size: stim_height.medium, add_data: {stimulus: 'ffgreen-blue-medium', size: 'medium', colour: 'blue', congruency: 'incongruent'}},
				{stim_path: 'stimuli/ffred-red.svg', stim_size: stim_height.large, add_data: {stimulus: 'ffred-red-large', size: 'large', colour: 'red', congruency: 'congruent'}},
				{stim_path: 'stimuli/ffred-red.svg', stim_size: stim_height.large, add_data: {stimulus: 'ffred-red-large', size: 'large', colour: 'red', congruency: 'congruent'}},
				{stim_path: 'stimuli/ffred-blue.svg', stim_size: stim_height.large, add_data: {stimulus: 'ffred-blue-large', size: 'large', colour: 'blue', congruency: 'incongruent'}},
				{stim_path: 'stimuli/ffred-green.svg', stim_size: stim_height.large, add_data: {stimulus: 'ffred-green-large', size: 'large', colour: 'green', congruency: 'incongruent'}},
				{stim_path: 'stimuli/ffblue-blue.svg', stim_size: stim_height.large, add_data: {stimulus: 'ffblue-blue-large', size: 'large', colour: 'blue', congruency: 'congruent'}},
				{stim_path: 'stimuli/ffblue-blue.svg', stim_size: stim_height.large, add_data: {stimulus: 'ffblue-blue-large', size: 'large', colour: 'blue', congruency: 'congruent'}},
				{stim_path: 'stimuli/ffblue-red.svg', stim_size: stim_height.large, add_data: {stimulus: 'ffblue-red-large', size: 'large', colour: 'red', congruency: 'incongruent'}},
				{stim_path: 'stimuli/ffblue-green.svg', stim_size: stim_height.large, add_data: {stimulus: 'ffblue-green-large', size: 'large', colour: 'green', congruency: 'incongruent'}},
				{stim_path: 'stimuli/ffgreen-green.svg', stim_size: stim_height.large, add_data: {stimulus: 'ffgreen-green-large', size: 'large', colour: 'green', congruency: 'congruent'}},
				{stim_path: 'stimuli/ffgreen-green.svg', stim_size: stim_height.large, add_data: {stimulus: 'ffgreen-green-large', size: 'large', colour: 'green', congruency: 'congruent'}},
				{stim_path: 'stimuli/ffgreen-red.svg', stim_size: stim_height.large, add_data: {stimulus: 'ffgreen-red-large', size: 'large', colour: 'red', congruency: 'incongruent'}},
				{stim_path: 'stimuli/ffgreen-blue.svg', stim_size: stim_height.large, add_data: {stimulus: 'ffgreen-blue-large', size: 'large', colour: 'blue', congruency: 'incongruent'}},
			],
			randomize_order: true,
			// 'repetitions:' would go here, but we will assign this more dynamically later
		}

		//////////////////////////////////////////////////////
		/* grab all the image paths, so we can preload them */
		//////////////////////////////////////////////////////

		var stroop_image_paths = []; // init the variable
		for (i = 0; i < stroop_task.timeline_variables.length; i++) {
			stroop_image_paths[i] = stroop_task.timeline_variables[i].stim_path;
		}
		var falsefont_image_paths = []; // init the variable
		for (i = 0; i < false_font_task.timeline_variables.length; i++) {
			falsefont_image_paths[i] = false_font_task.timeline_variables[i].stim_path;
		}

		////////////////////////
		/* procedure creation */
		////////////////////////

		var stroop_colour_proc = [
			colour_instructions,
			pre_training,
			// now we spread (shallow copy) the block object, and add to the keys inside - we need to be careful here, because it will only shallow copy: editing too deep will permanently alter the block object
			{...stroop_task, timeline: [stroop_task.timeline[0], stroop_task.timeline[1], colour_feedback], repetitions: num_tr_blocks},
			pre_test,
			// same again - spread the block object and add to the keys inside
			{...stroop_task, repetitions: num_blocks},
			finished_task
		];
		
		var stroop_size_proc = [
			size_instructions,
			pre_training,
			{...stroop_task, timeline: [stroop_task.timeline[0], stroop_task.timeline[1], size_feedback], repetitions: num_tr_blocks},
			pre_test,
			{...stroop_task, repetitions: num_blocks},
			finished_task
		];

		var falsefont_colour_proc = [
			colour_instructions,
			pre_training,
			{...false_font_task, timeline: [false_font_task.timeline[0], false_font_task.timeline[1], colour_feedback], repetitions: num_tr_blocks},
			pre_test,
			{...false_font_task, repetitions: num_blocks},
			finished_task
		];

		var falsefont_size_proc = [
			size_instructions,
			pre_training,
			{...false_font_task, timeline: [false_font_task.timeline[0], false_font_task.timeline[1], size_feedback], repetitions: num_tr_blocks},
			pre_test,
			{...false_font_task, repetitions: num_blocks},
			finished_task
		];
		
		var unshuffled_procedure = [stroop_colour_proc, stroop_size_proc, falsefont_colour_proc, falsefont_size_proc]; // place all into a single array

		function shuffle(array) { // fisher-yates shuffler function
			var m = array.length, t, i;

			// While there remain elements to shuffle…
			while (m) {

				// Pick a remaining element…
				i = Math.floor(Math.random() * m--);

				// And swap it with the current element.
				t = array[m];
				array[m] = array[i];
				array[i] = t;
			}

			return array;
		}

		var shuffled_procedure = shuffle(unshuffled_procedure).flat(); // shuffle the procedure, and flatten it into one layer
		
		for (i = 0; i < shuffled_procedure.length; i++) { // loop through the shuffled and flattened procedure array, and push each jsPsych trial block to the timeline
			timeline.push(shuffled_procedure[i]);
		}
