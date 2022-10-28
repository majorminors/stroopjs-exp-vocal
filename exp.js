function make_experiment (condition_num,jsPsych) {
    // in hindsight this is a little dangerous, because we call this function twice
    // in practice one error we have is that the unique_id saved to jatos is OVERWRITTEN the second running, but not in the filename saving function---so we have a different unique_id saved as the filenames. luckily the filenames are also saved each trial so it's not important but let's not do it this way again

    // requires condition_num for task permutation
    // if return_what == "images", will return image paths (for preloading)

        ////////////
        /* set up */
        ////////////

        var instructions_on = 1; // you can turn off (0) the first two instructions screens if you want to test (since the participant recording test takes a bit)
        var consent_on = 0; // turn on or off consent/demographics screens

        var num_blocks = 6; // will repeat each block of stimuli this number of times (blocked together)
        var num_tr_blocks = 1; // number of training blocks (same principle as num_blocks)
        var feedback_time = 800; // ms
        var fixation_time = 300; // ms
        var trial_time = 1500; // ms
	var stim_time = 470; //ms
        var max_instruction_time = 60000; //ms

        var unique_id = jsPsych.randomization.randomID(15); // generate a unique string for participant ID
        jsPsych.data.addProperties({ // push that to the data object
          condition_number: condition_num,
          unique_id: unique_id
          // we'll also add the id bin and permutation of procedures
        });
        console.log("id number: ", unique_id);

	// we'll use this to save trial data occasionally
        var save_data_count = 0;
        var last_save_data = 0;
        var save_data_every = 10;

        // little function to produce a stimulus html from image path and height
        function htmlStimSizer(height, path){
            html='<img src="';
            html+= path;
            html+='" style="height:';
            html+= height;
            html+='">';
            return html;
        }

        //////////////////////
        /* stimuli creation */
        //////////////////////

        var colours = ["red", "blue", "green"];

        var window_height = window.innerHeight; // get the window height in pixels	
        var stim_height = { // stimulus height in pixels - width is auto (i.e. will maintain aspect ratio)
            short: '50px', //window_height*0.1,
            medium: '150px', //window_height*0.3,
            tall: '300px' //window_height*0.5
        }

        // little stimulus factory we'll use later when constructing the trials
        // produces a complete stimulus object that can be indexed into by a trial variablec as a timeline variable.
        function stimulusFactory(colour, print, size){
            var stim_path = `stimuli/${print}-${colour}.png`;
            var stim_size = stim_height[size];
            var trn_stim = `stimuli/${colour}.png`;
            var congruency;
            if (print.includes(colour)) {
                congruency = 'congruent';
            } else {
                congruency = 'incongruent';
            }
            return {
                stim_path,
                stim_size,
                trn_stim,
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
        //              stimulusFactory("green", "red", "short"),
        //              stimulusFactory("green", "blue", "short"),
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
        if (consent_on == 1) {
            get_consent(timeline); // do the consent function
            get_demographics(timeline); // do the demographics function
        }

        //////////////////////////////////
        /* do window and viewport stuff */
        //////////////////////////////////

        var screen_dimensions = { // get screen and viewport dimensions
            type: jsPsychCallFunction,
            func: function(){
                var w=window,d=document,e=d.documentElement,g=d.getElementsByTagName('body')[0],viewx=w.innerWidth||e.clientWidth||g.clientWidth,viewy=w.innerHeight||e.clientHeight||g.clientHeight; // lots of shorcuts, but essentially just get some javascript height and width descriptors
                var dpcm=function(){
                    // calc display pixels per cm
                    const el = document.createElement('div'); // create a div
                    el.style = 'width: 1cm;' // make it one cm wide
                    document.body.appendChild(el); // add it as a child of the body
                    const dpcm = el.offsetWidth; // measure the pixels of the css width and save that
                    document.body.removeChild(el); // remove it as a child of the body
                    return dpcm; // return the pixels per cm
                }
                var width_cm = viewx/dpcm;
                var height_cm = viewy/dpcm;
                jsPsych.data.getLastTrialData().addToAll({ // add screen and viewport info to the resize trial data. that way, all sz info is together
                    screen_width_px: screen.width,
                    screen_height_px: screen.height, 
                    viewport_width_px: viewx,
                    viewport_height_px: viewy,
                    px_per_cm: dpcm,
                    viewport_width_cm: width_cm,
                    viewport_height_cm: height_cm,
                })
            },
        }
        timeline.push(screen_dimensions);

        // standardise the screen size
        var screen_sizer = {
            type: jsPsychResize,
            item_width: 3 + 3/8, // I think this is in inches
            item_height: 2 + 1/8,
            prompt: "<p>Click and drag the lower right corner of the box until the box is the same size as a bank card held up to the screen.</p>",
            pixels_per_unit: 150
        }
        timeline.push(screen_sizer);

        //////////////////////
        /* instruction bits */
        //////////////////////

        var instructions_onstart = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus:"<p>In this experiment you'll see images on the screen and respond by speaking aloud.<br>You'll need to allow microphone access in your browser if you haven't already.<br>I will prompt you for this shortly. Be sure to select 'remember the decision' so you don't get prompted every time.<br>There are four different task in this experiment.<br>Each one is slightly different, although all are similar.<br>At the start of each task, you'll get some instructions.<br>Then there will be a short 'training' period during which we'll tell you the correct answer after each trial.<br>Then you'll start the block properly and you won't get any feedback until the next block.<br><br>When ready, press any key continue.</p>",
            trial_duration: max_instruction_time*2
        }

        /* intro to the recording trial */
        var participant_test = {
            type: jsPsychHtmlAudioResponse,
            stimulus: "<p>Recording has started. Speak!<br>This trial just lets you test things out.<br>This example trial records for 6 seconds and at the end you can play it back or rerecord as you like.<br>If you can hear yourself well, we're good to go.<br>If not, please DO NOT CONTINUE---I might not be able to accept your data!<br>In the experiment itself, you will not be able to playback, or rerecord.<br>We will just record automatically on every trial.</p>",
            allow_playback: true,
            done_button_label: 'Continue if you hear yourself LOUD and CLEAR',
            recording_duration: 6000,
        }

        var record_background = {
            type: jsPsychHtmlAudioResponse,
            stimulus: "<p>I'm now recording 15 seconds of background noise.<br>The idea is to allow me to try and remove this from your recordings so I can hear you better<br>Please try not to make additional noise in this time (e.g. shifting, clearing throat, etc).<br>If some <em>unusual</em> loud sound happens during the recording (e.g. a glass breaking, a car backfiring) then please re-record.</p>",
            allow_playback: true,
            done_button_label: 'Continue if that was 15s of normal background noise',
            recording_duration: 15000,
        }

        var final_prestructions = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus:"<p>Some last requests.<br><br>I am recording on every trial, but never when feedback or instructions are shown.<br>Please be aware of your surroundings and keep noise (other than your voice!) to a minimum.<br>Please, please, please speak LOUD and CLEAR!<br>Otherwise it will be hard for me to hear your answers<br>Please be as fast and as accurate as possible.<br>Lastly, please DO NOT let your screensaver go on! You might be able to prevent this with fullscreen (F11)<br><br>When ready, press SPACE BAR to continue.</p>",
            trial_duration: max_instruction_time*2,
            choices: [' ']
        }

        /* push those to the timeline, if instructions are on */
        if (instructions_on == 1) {
            timeline.push(instructions_onstart);
            timeline.push(participant_test);
            timeline.push(record_background);
            timeline.push(final_prestructions);
        }


        /* report size instructions */
        var size_instructions = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: '<p>In this version of the task, you must report the <em>height</em> of the image by speaking aloud.<br>They will be either short, medium, or tall.<br>Please keep your eyes on the centre of the screen throughout.<br><br>Press any key to continue.</p>',
            trial_duration: max_instruction_time,
        }
        var size_instruction_reminder = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: '<p>Remember, you must report the <em>height</em> of the image by speaking aloud.<br>It will be either short, medium, or tall.<br>Please keep your eyes on the centre of the screen throughout.<br><br>Press any key to continue.</p>',
            trial_duration: max_instruction_time,
        }

        /* report colour instructions */
        var colour_instructions = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: '<p>In this version of the task, you must report the <em>colour</em> of the image by speaking aloud.<br>It will be either red, blue, or green.<br>Please keep your eyes on the centre of the screen throughout.<br><br>Press any key to continue.</p>',
            trial_duration: max_instruction_time,
        }
        var colour_instruction_reminder = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: '<p>Remember, you must report the <em>colour</em> of the image by speaking aloud.<br>It will be either red, blue, or green.<br>Please keep your eyes on the centre of the screen throughout.<br><br>Press any key to continue.</p>',
            trial_duration: max_instruction_time,
        }

        /* pre item instructions */
        var pre_1d_training = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: 'We will start with a block of training on an easy stimulus first. We will give you feedback each trial.<br><br> Press any key to continue.</p>',
            trial_duration: max_instruction_time,
        }
        var pre_training = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: 'Now another block of training with a different stimulus. We will give you feedback each trial.<br><br> Press any key to continue.</p>',
            trial_duration: max_instruction_time,
        }
        var pre_test = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: 'Now we begin the test. You will no longer recieve feedback.<br>Please answer as fast and as accurately as possible.<br><br> Press any key to continue.</p>',
            trial_duration: max_instruction_time,
        }

        /* finished task instructions */
        var finished_task = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: "You've finished this version of the task. Well done.<br><br>Press any key to continue.</p>",
            trial_duration: max_instruction_time,
        }

        //////////////////
        /* trial blocks */
        //////////////////
        
        /* we need this because for some reason the feedback trial placed directly after an audio-response trial speeds past */
        var spacer_trial = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: '<p> </p>',
            choices: "NO_KEYS",
            trial_duration: 50,
        }

        /* feedback objects we can call later when we put together the procedure */
        var size_feedback = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: () => {
                var size_string = jsPsych.data.get().last(2).values()[0].stim_data.size;
                return '<p>correct answer: <span style="font-size: 40px;">'+JSON.stringify(size_string)+'</span></p>';
            },
            choices: "NO_KEYS",
            trial_duration: feedback_time,
        }
        var colour_feedback = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: () => {
                var colour_string = jsPsych.data.get().last(2).values()[0].stim_data.colour;
                return '<p> correct answer: <span style="font-size: 40px;">'+JSON.stringify(colour_string)+'</span></p>';
            },
            choices: "NO_KEYS",
            trial_duration: feedback_time,
        }

        /* stroop task */
        var stroop_task = {
            timeline: [
                {
                    type: jsPsychHtmlKeyboardResponse,
                    stimulus: '<div style="font-size:60px;">+</div>',
                    choices: "NO_KEYS",
                    trial_duration: fixation_time,
                    data: {
                        stim_data: jsPsych.timelineVariable('add_data'), // pull this in so we can access it in a subsequent trial
                        exp_part: "fixation",
                    }
                },
                { // size only training block
                    type: jsPsychHtmlAudioResponse,
                    stimulus: htmlStimSizer(jsPsych.timelineVariable('stim_size'),'stimuli/line.png'),
                    allow_playback: false,
                    show_done_button: false,
                    recording_duration: trial_time,
                    stimulus_duration: stim_time,
                    data: {
                        stim_data: jsPsych.timelineVariable('add_data'),
                    }
                },
                { // colour only training block
                    type: jsPsychHtmlAudioResponse,
                    stimulus: htmlStimSizer(stim_height.medium,jsPsych.timelineVariable('trn_stim')),
                    allow_playback: false,
                    show_done_button: false,
                    recording_duration: trial_time,
                    stimulus_duration: stim_time,
                    data: {
                        stim_data: jsPsych.timelineVariable('add_data'),
                    }
                },
                { // stimulus block
                    type: jsPsychHtmlAudioResponse,
                    stimulus: htmlStimSizer(jsPsych.timelineVariable('stim_size'),jsPsych.timelineVariable('stim_path')),
                    allow_playback: false,
                    show_done_button: false,
                    recording_duration: trial_time,
                    stimulus_duration: stim_time,
                    data: {
                        stim_data: jsPsych.timelineVariable('add_data'),
                    },
		    on_finish: () => {
                        // save the data every save_data_every trials
                        save_data_count++
                        if (save_data_count > last_save_data+save_data_every) {
                            last_save_data = save_data_count;
                            var thisSessionData = jatos.studySessionData;
                            var thisExpData = JSON.parse(jsPsych.data.get().json());
                            var resultJson = {...thisSessionData, ...thisExpData};
                            jatos.submitResultData(resultJson)
                               .then(() => console.log('data submitted, results saved'));
                            console.log('results saved');
                        }
		    }
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
                    type: jsPsychHtmlKeyboardResponse,
                    stimulus: '<div style="font-size:60px;">+</div>',
                    choices: "NO_KEYS",
                    trial_duration: fixation_time,
                    data: {
                        stim_data: jsPsych.timelineVariable('add_data'), // pull this in so we can access it in a subsequent trial
                        exp_part: "fixation",
                    }
                },
                { // size only training block
                    type: jsPsychHtmlAudioResponse,
                    stimulus: htmlStimSizer(jsPsych.timelineVariable('stim_size'),'stimuli/line.png'),
                    allow_playback: false,
                    show_done_button: false,
                    recording_duration: trial_time,
                    stimulus_duration: stim_time,
                    data: {
                        stim_data: jsPsych.timelineVariable('add_data'),
                    }
                },
                { // colour only training block
                    type: jsPsychHtmlAudioResponse,
                    stimulus: htmlStimSizer(stim_height.medium,jsPsych.timelineVariable('trn_stim')),
                    allow_playback: false,
                    show_done_button: false,
                    recording_duration: trial_time,
                    stimulus_duration: stim_time,
                    data: {
                        stim_data: jsPsych.timelineVariable('add_data'),
                    }
                },
                { // stimulus block
                    type: jsPsychHtmlAudioResponse,
                    stimulus: htmlStimSizer(jsPsych.timelineVariable('stim_size'),jsPsych.timelineVariable('stim_path')),
                    allow_playback: false,
                    show_done_button: false,
                    recording_duration: trial_time,
                    stimulus_duration: stim_time,
                    data: {
                        stim_data: jsPsych.timelineVariable('add_data'),
                    },
		    on_finish: () => {
                        // save the data every save_data_every trials
                        save_data_count++
                        if (save_data_count > last_save_data+save_data_every) {
                            last_save_data = save_data_count;
                            var thisSessionData = jatos.studySessionData;
                            var thisExpData = JSON.parse(jsPsych.data.get().json());
                            var resultJson = {...thisSessionData, ...thisExpData};
                            jatos.submitResultData(resultJson)
                               .then(() => console.log('data submitted, results saved'));
                            console.log('results saved');
                        }
		    }
                }
            ],
            timeline_variables: stimListFactory(colours, true, Object.keys(stim_height)),
            randomize_order: true,
            // 'repetitions:' would go here, but we will assign this more dynamically later
        }
        console.log(false_font_task.timeline_variables);

        ////////////////////////
        /* procedure creation */
        ////////////////////////

        var stroop_colour_proc = [
            colour_instructions, // precede stroop with colour instructions
            pre_1d_training,
            // now we spread (shallow copy) the block object, and add to the keys inside - we need to be careful here, because it will only shallow copy: editing too deep will permanently alter the block object
            {...stroop_task, timeline: [stroop_task.timeline[0], {...stroop_task.timeline[2], data: {...stroop_task.timeline[2].data, exp_part: "training", test_type: "colour_only"}}, spacer_trial, colour_feedback], repetitions: num_tr_blocks}, // append feedback to the stroop and add repetitions
            pre_training, // pre task instructions
            colour_instruction_reminder, // precede the task with the reminder of the task
            // same again - spread the block object and add to the keys inside
            {...stroop_task, timeline: [stroop_task.timeline[0], {...stroop_task.timeline[3], data: {...stroop_task.timeline[3].data, exp_part: "training", test_type: "colour"}}, spacer_trial, colour_feedback], repetitions: num_tr_blocks},
            pre_test,
            // same again - spread the block object and add to the keys inside
            {...stroop_task, timeline: [stroop_task.timeline[0], {...stroop_task.timeline[3], data: {...stroop_task.timeline[3].data, exp_part: "testing", test_type: "colour"}}], repetitions: num_blocks},
            finished_task
        ];
        
        var stroop_size_proc = [
            size_instructions,
            pre_1d_training,
            {...stroop_task, timeline: [stroop_task.timeline[0], {...stroop_task.timeline[1], data: {...stroop_task.timeline[1].data, exp_part: "training", test_type: "size_only"}}, spacer_trial, size_feedback], repetitions: num_tr_blocks},
            pre_training,
            size_instruction_reminder,
            {...stroop_task, timeline: [stroop_task.timeline[0], {...stroop_task.timeline[3], data: {...stroop_task.timeline[3].data, exp_part: "training", test_type: "size"}}, spacer_trial, size_feedback], repetitions: num_tr_blocks},
            pre_test,
            {...stroop_task, timeline: [stroop_task.timeline[0], {...stroop_task.timeline[3], data: {...stroop_task.timeline[3].data, exp_part: "testing", test_type: "size"}}], repetitions: num_blocks},
            finished_task
        ];

        var falsefont_colour_proc = [
            colour_instructions,
            pre_1d_training,
            {...false_font_task, timeline: [false_font_task.timeline[0], {...false_font_task.timeline[2], data: {...false_font_task.timeline[2].data, exp_part: "training", test_type: "colour_only"}}, spacer_trial, colour_feedback], repetitions: num_tr_blocks},
            pre_training,
            colour_instruction_reminder,
            {...false_font_task, timeline: [false_font_task.timeline[0], {...false_font_task.timeline[3], data: {...false_font_task.timeline[3].data, exp_part: "training", test_type: "colour"}}, spacer_trial, colour_feedback], repetitions: num_tr_blocks},
            pre_test,
            {...false_font_task, timeline: [false_font_task.timeline[0], {...false_font_task.timeline[3], data: {...false_font_task.timeline[3].data, exp_part: "testing", test_type: "colour"}}], repetitions: num_blocks},
            finished_task
        ];

        var falsefont_size_proc = [
            size_instructions,
            pre_1d_training,
            {...false_font_task, timeline: [false_font_task.timeline[0], {...false_font_task.timeline[1], data: {...false_font_task.timeline[1].data, exp_part: "training", test_type: "size_only"}}, spacer_trial, size_feedback], repetitions: num_tr_blocks},
            pre_training,
            size_instruction_reminder,
            {...false_font_task, timeline: [false_font_task.timeline[0], {...false_font_task.timeline[3], data: {...false_font_task.timeline[3].data, exp_part: "training", test_type: "size"}}, spacer_trial, size_feedback], repetitions: num_tr_blocks},
            pre_test,
            {...false_font_task, timeline: [false_font_task.timeline[0], {...false_font_task.timeline[3], data: {...false_font_task.timeline[3].data, exp_part: "testing", test_type: "size"}}], repetitions: num_blocks},
            finished_task
        ];
        
        var unshuffled_procedure = [stroop_colour_proc, stroop_size_proc, falsefont_colour_proc, falsefont_size_proc]; // place all into a single array

        // create a function to get all permutations of an array
        // little long, but the fastest
        function permute(permutation) {
          var length = permutation.length,
              result = [permutation.slice()],
              c = new Array(length).fill(0),
              i = 1, k, p;

          while (i < length) {
            if (c[i] < i) {
              k = i % 2 && c[i];
              p = permutation[i];
              permutation[i] = permutation[k];
              permutation[k] = p;
              ++c[i];
              i = 1;
              result.push(permutation.slice());
            } else {
              c[i] = 0;
              ++i;
            }
          }
          return result;
        }
        // now permute the procedures
        var permutations = permute(unshuffled_procedure);

        // a function to bin condition_nums evenly into permutations (in case we're passing in a participant ID for example)
        function permutation_selector (id, permutations) {
            length = permutations.length;
            if (id >= length) { // if id is larger than the number of permutations
                reduced_id = id % length; // divide id by # of permutations and make the new id the remainder
                return reduced_id;
            } else {
                return id;
            }
        }
        // this is where we'd chose a permutation based on the condition_num of the subject
        condition_bin = permutation_selector(condition_num, permutations);
        thispermutation = permutations[condition_bin];
        console.log("condition bin: ", condition_bin);
        
        jsPsych.data.addProperties({ // push those to the data object
            condition_bin: condition_bin,
        });

        // now we're going to edit this permutation of the procedures, cutting the training from the second occurrence of each task type
        // create an editor function to edit easy training from procedure
        function proc_editor (x) {
            x.splice(1,2); // delete 2 from position 1 (which should remove 1d stuff)
            x.splice(2,1); // delete 1 from position 2 AFTER the positions have changed from the previous splice (should remove instruction reminder)
            return x;
        }
        // init counters
        hCount = 0;
        cCount = 0;
        thispermutation.forEach(procedure => {
           if (procedure[0].stimulus.includes("height")) {
               hCount++;
               if (hCount == 2) { // if second time occurring, then cut easy training out
                    proc_editor(procedure);
               }
           }
           if (procedure[0].stimulus.includes("colour")) {
               cCount++;
               if (cCount == 2) { // if second time occurring, then cut easy training out
                    proc_editor(procedure);
               }
           }
        });
        console.log("permutation of procedures: ", thispermutation);
        var flattened_procedure = thispermutation.flat(); // flatten into one layer

        for (i = 0; i < flattened_procedure.length; i++) { // loop through the shuffled and flattened procedure array, and push each jsPsych trial block to the timeline
            timeline.push(flattened_procedure[i]);
        }

        /////////////////////////////////////////////////////////////
        /* set up a thank you trial and append the procedure to it */
        /////////////////////////////////////////////////////////////
        
        var finish_screen = { 
            type: jsPsychHtmlKeyboardResponse,
            stimulus: "<p>All done!<br><br>Thanks so much for participating.<br>Feel free to email me if you'd like to know more about what the study was exploring.<br>dorian.minors@mrc-cbu.cam.ac.uk<br><br>Press any key to finish and please wait to be redirected.</p>",
            trial_duration: max_instruction_time,
            data: { procedure: thispermutation }
        }
        timeline.push(finish_screen);

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
        var oned_image_paths = []; // init the variable
        oned_image_paths[colours.length] = "stimuli/line.png";
        for (i = 0; i < colours.length; i++) {
           oned_image_paths[i] = `stimuli/${colours[i]}.png`;
        }

        var image_paths = [stroop_image_paths, falsefont_image_paths,oned_image_paths];

        ///////////////////////////
        /* package everything up */
        ///////////////////////////

        return {
            timeline: timeline,
            image_paths: image_paths,
        };
}
