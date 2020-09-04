
		////////////
		/* set up */
		////////////

		var instructions_on = 1; // you can turn off (0) the first two instructions screens if you want to test (since the participant recording test takes a bit)

		var num_blocks = 2; // will repeat each block of stimuli this number of times (blocked together)
		var num_tr_blocks = 1; // number of training blocks (same principle as num_blocks)

        //////////////////////
        /* stimuli creation */
        //////////////////////

        var colours = ["red", "blue", "green"];

		var window_height = window.innerHeight; // get the window height in pixels	
        var stim_height = { // stimulus height in pixels - width is auto (i.e. will maintain aspect ratio)
			small: window_height*0.1,
			medium: window_height*0.3,
			large: window_height*0.5
		}

        // little stimulus factory we'll use later when constructing the trials
        // produces a complete stimulus object that can be indexed into by a trial variablec as a timeline variable.
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

        // create a little factory to put together a stimulus list for the timeline variable
        // will produce a list of calls to the stimulusFactory
        // don't have to use this--can just call stimulus factory directly however many times like:
        //          timeline_variables: [
        //              stimulusFactory("green", "red", "small"),
        //              stimulusFactory("green", "blue", "small"),
        //              ...
        //          ]
        function stimListFactory(colours, doFalseFont, sizes) {
            let stimulus_list = [];
        
            let printed_words = [...colours]
            // in this case, the print is the same as the colours (or based off the colours in the case of the false fonts)
            // with different printed words, just replace 'doFalseFont' with prints and replace the references to `final_print`
        
            colours.forEach(colour => {
                // console.log('Ink colour: ' + colour)
        
                sizes.forEach(size => {
                    // console.log('Size: ' + size)
        
                    printed_words.forEach(print => {
                        // console.log('Print Colour: ' + print)
        
                        let final_print = doFalseFont ? ('ff' + print) : print
                        // if doFalseFont is true, append 'ff' to print, else just pass print
        
                        if(colour === print) {
                            // produce calls to create two of any congruent stimuli
                            stimulus_list.push(stimulusFactory(colour, final_print, size))
                            stimulus_list.push(stimulusFactory(colour, final_print, size))
                        } else {
                            // produce calls to create one of each incongruent stimulus type
                            stimulus_list.push(stimulusFactory(colour, final_print, size))
                        }
                    });
                });
            });
        
            return stimulus_list;
        } 

		var timeline = []; // initialise timeline
		
		//////////////////////
		/* instruction bits */
		//////////////////////

		var instructions_onstart = {
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
			timeline.push(instructions_onstart);
			timeline.push(participant_test);
		}


		/* report size instructions */
		var size_instructions = {
			type: 'html-keyboard-response',
			stimulus: '<p>In this version of the task, you must report the <em>size</em> of the image by speaking aloud.<br>The size of these symbols differ in <strong>height</strong>. They will be either small, medium, or large.<br>Please watch the centre of the screen between images!<br><br>Press any key to continue.</p>',
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
					trial_duration: 300,
                    data: jsPsych.timelineVariable('add_data') // pull this in so we can access it in a subsequent trial
				},
				{ // training block, colour: shows correct response for colour -- stroop_task.timeline[1]
					type: 'image-audio-response',
                    stimulus: jsPsych.timelineVariable('stim_path'),
                    additional_stimulus: function(){
                        var colour_string = jsPsych.data.get().last(1).values()[0].colour;
                        return '<div style="position: absolute; top: 0px; right: 0px; margin-top: 20px; margin-right: 20px;"><p> correct answer: '+JSON.stringify(colour_string)+'</p></div>';
                    },
					allow_playback: false,
					buffer_length: 2000,
					wait_for_mic_approval: false,
					stimulus_height: jsPsych.timelineVariable('stim_size'),
					recording_indicator: 2,
					data: jsPsych.timelineVariable('add_data')
				},
				{ // training block, size: shows correct response for size -- stroop_task.timeline[2]
					type: 'image-audio-response',
                    stimulus: jsPsych.timelineVariable('stim_path'),
                    additional_stimulus: function(){
                        var size_string = jsPsych.data.get().last(1).values()[0].size;
                        return '<div style="position: absolute; top: 0px; right: 0px; margin-top: 20px; margin-right: 20px;"><p> correct answer: '+JSON.stringify(size_string)+'</p></div>';
                    },
					allow_playback: false,
					buffer_length: 2000,
					wait_for_mic_approval: false,
					stimulus_height: jsPsych.timelineVariable('stim_size'),
					recording_indicator: 2,
					data: jsPsych.timelineVariable('add_data')
				},
				{ // testing block: does not show correct response - stroop_task.timeline[3]
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
            timeline_variables: stimListFactory(colours, false, Object.keys(stim_height)),
			randomize_order: true,
			// 'repetitions:' would go here, but we will assign this more dynamically later
		}
        console.log(stroop_task.timeline_variables);

		/* false font task */
		var false_font_task = {
			timeline: [
				{
					type: 'html-keyboard-response',
					stimulus: '<div style="font-size:60px;">+</div>',
					choices: jsPsych.NO_KEYS,
					trial_duration: 300,
                    data: jsPsych.timelineVariable('add_data') // pull this in so we can access it in a subsequent trial
				},
				{ // training block, colour: shows correct response for colour -- false_font_task.timeline[1]
					type: 'image-audio-response',
                    stimulus: jsPsych.timelineVariable('stim_path'),
                    additional_stimulus: function(){
                        var colour_string = jsPsych.data.get().last(1).values()[0].colour;
                        return '<div style="position: absolute; top: 0px; right: 0px; margin-top: 20px; margin-right: 20px;"><p> correct answer: '+JSON.stringify(colour_string)+'</p></div>';
                    },
					allow_playback: false,
					buffer_length: 2000,
					wait_for_mic_approval: false,
					stimulus_height: jsPsych.timelineVariable('stim_size'),
					recording_indicator: 2,
					data: jsPsych.timelineVariable('add_data')
				},
				{ // training block, size: shows correct response for size -- false_font_task.timeline[2]
					type: 'image-audio-response',
                    stimulus: jsPsych.timelineVariable('stim_path'),
                    additional_stimulus: function(){
                        var size_string = jsPsych.data.get().last(1).values()[0].size;
                        return '<div style="position: absolute; top: 0px; right: 0px; margin-top: 20px; margin-right: 20px;"><p> correct answer: '+JSON.stringify(size_string)+'</p></div>';
                    },
					allow_playback: false,
					buffer_length: 2000,
					wait_for_mic_approval: false,
					stimulus_height: jsPsych.timelineVariable('stim_size'),
					recording_indicator: 2,
					data: jsPsych.timelineVariable('add_data')
				},
				{ // testing block: does not show correct response -- false_font_task.timeline[3]
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
            timeline_variables: stimListFactory(colours, true, Object.keys(stim_height)),
			randomize_order: true,
			// 'repetitions:' would go here, but we will assign this more dynamically later
		}
        console.log(false_font_task.timeline_variables);

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
			colour_instructions, // precede stroop with colour instructions
			pre_training, // pre task instructions
			// now we spread (shallow copy) the block object, and add to the keys inside - we need to be careful here, because it will only shallow copy: editing too deep will permanently alter the block object
			{...stroop_task, timeline: [stroop_task.timeline[0], stroop_task.timeline[1], colour_feedback], repetitions: num_tr_blocks}, // append feedback to the stroop and add repetitions
			pre_test,
			// same again - spread the block object and add to the keys inside
			{...stroop_task, timeline: [stroop_task.timeline[0], stroop_task.timeline[3]], repetitions: num_blocks},
			finished_task
		];
		
		var stroop_size_proc = [
			size_instructions,
			pre_training,
			{...stroop_task, timeline: [stroop_task.timeline[0], stroop_task.timeline[2], size_feedback], repetitions: num_tr_blocks},
			pre_test,
			{...stroop_task, timeline: [stroop_task.timeline[0], stroop_task.timeline[3]], repetitions: num_blocks},
			finished_task
		];

		var falsefont_colour_proc = [
			colour_instructions,
			pre_training,
			{...false_font_task, timeline: [false_font_task.timeline[0], false_font_task.timeline[1], colour_feedback], repetitions: num_tr_blocks},
			pre_test,
			{...false_font_task, timeline: [false_font_task.timeline[0], false_font_task.timeline[3]], repetitions: num_blocks},
			finished_task
		];

		var falsefont_size_proc = [
			size_instructions,
			pre_training,
			{...false_font_task, timeline: [false_font_task.timeline[0], false_font_task.timeline[2], size_feedback], repetitions: num_tr_blocks},
			pre_test,
			{...false_font_task, timeline: [false_font_task.timeline[0], false_font_task.timeline[3]], repetitions: num_blocks},
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
