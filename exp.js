
		////////////
		/* set up */
		////////////

		var instructions_on = 1; // you can turn off (0) the first two instructions screens if you want to test (since the participant recording test takes a bit)

		var num_blocks = 2; // will repeat each block of stimuli this number of times (blocked together)
		var num_tr_blocks = 1; // number of training blocks (same principle as num_blocks)
		var window_height = window.innerHeight; // get the window height in pixels	
        
        var stim_height = { // stimulus height in pixels - width is auto (i.e. will maintain aspect ratio)
			small: window_height*0.1,
			medium: window_height*0.3,
			large: window_height*0.5
		} 

        // little stimulus factory we'll use later when constructing the trials
        function stimulusFactory(colour, print, size){
            var stim_path = `stimuli/${print}-${colour}.svg`;
            var stim_size = stim_height[size];
            var congruency;
            if (print.includes(colour)) {
                congruency = 'congruent';
            } else {
                congruency = 'incongruent';
            }
            return {
                stim_path,
                stim_size,
                add_data: {
                    colour,
                    print,
                    size,
                    congruency,
                }
            }
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
			recording_indicator: 2
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
					recording_indicator: 2,
					data: jsPsych.timelineVariable('add_data')
				}
			],
			timeline_variables: [
                stimulusFactory('red','red','small'),
                stimulusFactory('red','red','small'),
                stimulusFactory('red','blue','small'),
                stimulusFactory('red','green','small'),
                stimulusFactory('red','red','medium'),
                stimulusFactory('red','red','medium'),
                stimulusFactory('red','blue','medium'),
                stimulusFactory('red','green','medium'),
                stimulusFactory('red','red','large'),
                stimulusFactory('red','red','large'),
                stimulusFactory('red','blue','large'),
                stimulusFactory('red','green','large'),
                stimulusFactory('blue','blue','small'),
                stimulusFactory('blue','blue','small'),
                stimulusFactory('blue','red','small'),
                stimulusFactory('blue','green','small'),
                stimulusFactory('blue','blue','medium'),
                stimulusFactory('blue','blue','medium'),
                stimulusFactory('blue','red','medium'),
                stimulusFactory('blue','green','medium'),
                stimulusFactory('blue','blue','large'),
                stimulusFactory('blue','blue','large'),
                stimulusFactory('blue','red','large'),
                stimulusFactory('blue','green','large'),
                stimulusFactory('green','green','small'),
                stimulusFactory('green','green','small'),
                stimulusFactory('green','blue','small'),
                stimulusFactory('green','red','small'),
                stimulusFactory('green','green','medium'),
                stimulusFactory('green','green','medium'),
                stimulusFactory('green','blue','medium'),
                stimulusFactory('green','red','medium'),
                stimulusFactory('green','green','large'),
                stimulusFactory('green','green','large'),
                stimulusFactory('green','blue','large'),
                stimulusFactory('green','red','large'),
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
					recording_indicator: 2,
					data: jsPsych.timelineVariable('add_data')
				}
            ],
			timeline_variables: [
                stimulusFactory('red','ffred','small'),
                stimulusFactory('red','ffred','small'),
                stimulusFactory('red','ffblue','small'),
                stimulusFactory('red','ffgreen','small'),
                stimulusFactory('red','ffred','medium'),
                stimulusFactory('red','ffred','medium'),
                stimulusFactory('red','ffblue','medium'),
                stimulusFactory('red','ffgreen','medium'),
                stimulusFactory('red','ffred','large'),
                stimulusFactory('red','ffred','large'),
                stimulusFactory('red','ffblue','large'),
                stimulusFactory('red','ffgreen','large'),
                stimulusFactory('blue','ffblue','small'),
                stimulusFactory('blue','ffblue','small'),
                stimulusFactory('blue','ffred','small'),
                stimulusFactory('blue','ffgreen','small'),
                stimulusFactory('blue','ffblue','medium'),
                stimulusFactory('blue','ffblue','medium'),
                stimulusFactory('blue','ffred','medium'),
                stimulusFactory('blue','ffgreen','medium'),
                stimulusFactory('blue','ffblue','large'),
                stimulusFactory('blue','ffblue','large'),
                stimulusFactory('blue','ffred','large'),
                stimulusFactory('blue','ffgreen','large'),
                stimulusFactory('green','ffgreen','small'),
                stimulusFactory('green','ffgreen','small'),
                stimulusFactory('green','ffblue','small'),
                stimulusFactory('green','ffred','small'),
                stimulusFactory('green','ffgreen','medium'),
                stimulusFactory('green','ffgreen','medium'),
                stimulusFactory('green','ffblue','medium'),
                stimulusFactory('green','ffred','medium'),
                stimulusFactory('green','ffgreen','large'),
                stimulusFactory('green','ffgreen','large'),
                stimulusFactory('green','ffblue','large'),
                stimulusFactory('green','ffred','large'),
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
